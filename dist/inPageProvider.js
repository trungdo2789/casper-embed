var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EthereumProviderError } from "@metamask/rpc-errors";
import { PROVIDER_JRPC_METHODS, PROVIDER_NOTIFICATIONS } from "@toruslabs/base-controllers";
import dequal from "fast-deep-equal";
import BaseProvider from "./baseProvider";
import log from "./loglevel";
import messages from "./messages";
/**
 * @param connectionStream - A Node.js duplex stream
 * @param opts - An options bag
 */
class TorusInPageProvider extends BaseProvider {
    constructor(connectionStream, { maxEventListeners = 100, jsonRpcStreamName = "provider" }) {
        super(connectionStream, { maxEventListeners, jsonRpcStreamName });
        // private state
        this._state = Object.assign({}, TorusInPageProvider._defaultState);
        // public state
        this.selectedAddress = null;
        this.chainId = null;
        this._handleAccountsChanged = this._handleAccountsChanged.bind(this);
        this._handleChainChanged = this._handleChainChanged.bind(this);
        this._handleUnlockStateChanged = this._handleUnlockStateChanged.bind(this);
        // setup own event listeners
        // EIP-1193 connect
        this.on("connect", () => {
            this._state.isConnected = true;
        });
        const jsonRpcNotificationHandler = (payload) => {
            const { method, params } = payload;
            if (method === PROVIDER_NOTIFICATIONS.ACCOUNTS_CHANGED) {
                this._handleAccountsChanged(params);
            }
            else if (method === PROVIDER_NOTIFICATIONS.UNLOCK_STATE_CHANGED) {
                this._handleUnlockStateChanged(params);
            }
            else if (method === PROVIDER_NOTIFICATIONS.CHAIN_CHANGED) {
                this._handleChainChanged(params);
            }
        };
        // json rpc notification listener
        this.jsonRpcConnectionEvents.on("notification", jsonRpcNotificationHandler);
    }
    /**
     * Returns whether the inpage provider is connected to Torus.
     */
    isConnected() {
        return this._state.isConnected;
    }
    // Private Methods
    //= ===================
    /**
     * Constructor helper.
     * Populates initial state by calling 'wallet_getProviderState' and emits
     * necessary events.
     */
    _initializeState() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { accounts, chainId, isUnlocked } = (yield this.request({
                    method: PROVIDER_JRPC_METHODS.GET_PROVIDER_STATE,
                    params: [],
                }));
                // indicate that we've connected, for EIP-1193 compliance
                this.emit("connect", { chainId });
                this._handleChainChanged({ chainId });
                this._handleUnlockStateChanged({ accounts, isUnlocked });
                this._handleAccountsChanged(accounts);
            }
            catch (error) {
                log.error("Torus: Failed to get initial state. Please report this bug.", error);
            }
            finally {
                log.info("initialized provider state");
                this._state.initialized = true;
                this.emit("_initialized");
            }
        });
    }
    /**
     * Internal RPC method. Forwards requests to background via the RPC engine.
     * Also remap ids inbound and outbound
     */
    _rpcRequest(payload, callback, isInternal = false) {
        let cb = callback;
        const _payload = payload;
        if (!Array.isArray(_payload)) {
            if (!_payload.jsonrpc) {
                _payload.jsonrpc = "2.0";
            }
            if (_payload.method === "casper_accounts" || _payload.method === "casper_requestAccounts") {
                // handle accounts changing
                cb = (err, res) => {
                    this._handleAccountsChanged(res.result || [], _payload.method === "casper_accounts", isInternal);
                    callback(err, res);
                };
            }
            else if (_payload.method === "wallet_getProviderState") {
                this._rpcEngine.handle(payload, cb);
                return;
            }
        }
        this.tryWindowHandle(_payload, cb);
    }
    /**
     * When the provider becomes connected, updates internal state and emits
     * required events. Idempotent.
     *
     * @param chainId - The ID of the newly connected chain.
     * emits TorusInpageProvider#connect
     */
    _handleConnect(chainId) {
        if (!this._state.isConnected) {
            this._state.isConnected = true;
            this.emit("connect", { chainId });
            log.debug(messages.info.connected(chainId));
        }
    }
    /**
     * When the provider becomes disconnected, updates internal state and emits
     * required events. Idempotent with respect to the isRecoverable parameter.
     *
     * Error codes per the CloseEvent status codes as required by EIP-1193:
     * https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
     *
     * @param isRecoverable - Whether the disconnection is recoverable.
     * @param errorMessage - A custom error message.
     * emits TorusInpageProvider#disconnect
     */
    _handleDisconnect(isRecoverable, errorMessage) {
        if (this._state.isConnected || (!this._state.isPermanentlyDisconnected && !isRecoverable)) {
            this._state.isConnected = false;
            let error;
            if (isRecoverable) {
                error = new EthereumProviderError(1013, // Try again later
                errorMessage || messages.errors.disconnected());
                log.debug(error);
            }
            else {
                error = new EthereumProviderError(1011, // Internal error
                errorMessage || messages.errors.permanentlyDisconnected());
                log.error(error);
                this.chainId = null;
                this._state.accounts = null;
                this.selectedAddress = null;
                this._state.isUnlocked = false;
                this._state.isPermanentlyDisconnected = true;
            }
            this.emit("disconnect", error);
        }
    }
    /**
     * Called when accounts may have changed.
     */
    _handleAccountsChanged(accounts, isEthAccounts = false, isInternal = false) {
        // defensive programming
        let finalAccounts = accounts;
        if (!Array.isArray(finalAccounts)) {
            log.error("Torus: Received non-array accounts parameter. Please report this bug.", finalAccounts);
            finalAccounts = [];
        }
        for (const account of accounts) {
            if (typeof account !== "string") {
                log.error("Torus: Received non-string account. Please report this bug.", accounts);
                finalAccounts = [];
                break;
            }
        }
        // emit accountsChanged if anything about the accounts array has changed
        if (!dequal(this._state.accounts, finalAccounts)) {
            // we should always have the correct accounts even before casper_accounts
            // returns, except in cases where isInternal is true
            if (isEthAccounts && Array.isArray(this._state.accounts) && this._state.accounts.length > 0 && !isInternal) {
                log.error('Torus: "casper_accounts" unexpectedly updated accounts. Please report this bug.', finalAccounts);
            }
            this._state.accounts = finalAccounts;
            this.emit("accountsChanged", finalAccounts);
        }
        // handle selectedAddress
        if (this.selectedAddress !== finalAccounts[0]) {
            this.selectedAddress = finalAccounts[0] || null;
        }
    }
    /**
     * Upon receipt of a new chainId and networkVersion, emits corresponding
     * events and sets relevant public state.
     * Does nothing if neither the chainId nor the networkVersion are different
     * from existing values.
     *
     * emits TorusInpageProvider#chainChanged
     * @param networkInfo - An object with network info.
     */
    _handleChainChanged({ chainId } = {}) {
        if (!chainId) {
            log.error("Torus: Received invalid network parameters. Please report this bug.", { chainId });
            return;
        }
        if (chainId === "loading") {
            this._handleDisconnect(true);
        }
        else {
            this._handleConnect(chainId);
            if (chainId !== this.chainId) {
                this.chainId = chainId;
                if (this._state.initialized) {
                    this.emit("chainChanged", this.chainId);
                }
            }
        }
    }
    /**
     * Upon receipt of a new isUnlocked state, sets relevant public state.
     * Calls the accounts changed handler with the received accounts, or an empty
     * array.
     *
     * Does nothing if the received value is equal to the existing value.
     * There are no lock/unlock events.
     *
     * @param opts - Options bag.
     */
    _handleUnlockStateChanged({ accounts, isUnlocked } = {}) {
        if (typeof isUnlocked !== "boolean") {
            log.error("Torus: Received invalid isUnlocked parameter. Please report this bug.", { isUnlocked });
            return;
        }
        if (isUnlocked !== this._state.isUnlocked) {
            this._state.isUnlocked = isUnlocked;
            this._handleAccountsChanged(accounts || []);
        }
    }
}
TorusInPageProvider._defaultState = {
    accounts: null,
    isConnected: false,
    isUnlocked: false,
    initialized: false,
    isPermanentlyDisconnected: false,
    hasEmittedConnection: false,
};
export default TorusInPageProvider;
//# sourceMappingURL=inPageProvider.js.map