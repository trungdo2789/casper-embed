var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var TorusInPageProvider = /** @class */ (function (_super) {
    __extends(TorusInPageProvider, _super);
    function TorusInPageProvider(connectionStream, _a) {
        var _b = _a.maxEventListeners, maxEventListeners = _b === void 0 ? 100 : _b, _c = _a.jsonRpcStreamName, jsonRpcStreamName = _c === void 0 ? "provider" : _c;
        var _this = _super.call(this, connectionStream, { maxEventListeners: maxEventListeners, jsonRpcStreamName: jsonRpcStreamName }) || this;
        // private state
        _this._state = __assign({}, TorusInPageProvider._defaultState);
        // public state
        _this.selectedAddress = null;
        _this.chainId = null;
        _this._handleAccountsChanged = _this._handleAccountsChanged.bind(_this);
        _this._handleChainChanged = _this._handleChainChanged.bind(_this);
        _this._handleUnlockStateChanged = _this._handleUnlockStateChanged.bind(_this);
        // setup own event listeners
        // EIP-1193 connect
        _this.on("connect", function () {
            _this._state.isConnected = true;
        });
        var jsonRpcNotificationHandler = function (payload) {
            var method = payload.method, params = payload.params;
            if (method === PROVIDER_NOTIFICATIONS.ACCOUNTS_CHANGED) {
                _this._handleAccountsChanged(params);
            }
            else if (method === PROVIDER_NOTIFICATIONS.UNLOCK_STATE_CHANGED) {
                _this._handleUnlockStateChanged(params);
            }
            else if (method === PROVIDER_NOTIFICATIONS.CHAIN_CHANGED) {
                _this._handleChainChanged(params);
            }
        };
        // json rpc notification listener
        _this.jsonRpcConnectionEvents.on("notification", jsonRpcNotificationHandler);
        return _this;
    }
    /**
     * Returns whether the inpage provider is connected to Torus.
     */
    TorusInPageProvider.prototype.isConnected = function () {
        return this._state.isConnected;
    };
    // Private Methods
    //= ===================
    /**
     * Constructor helper.
     * Populates initial state by calling 'wallet_getProviderState' and emits
     * necessary events.
     */
    TorusInPageProvider.prototype._initializeState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, accounts, chainId, isUnlocked, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, this.request({
                                method: PROVIDER_JRPC_METHODS.GET_PROVIDER_STATE,
                                params: [],
                            })];
                    case 1:
                        _a = (_b.sent()), accounts = _a.accounts, chainId = _a.chainId, isUnlocked = _a.isUnlocked;
                        // indicate that we've connected, for EIP-1193 compliance
                        this.emit("connect", { chainId: chainId });
                        this._handleChainChanged({ chainId: chainId });
                        this._handleUnlockStateChanged({ accounts: accounts, isUnlocked: isUnlocked });
                        this._handleAccountsChanged(accounts);
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _b.sent();
                        log.error("Torus: Failed to get initial state. Please report this bug.", error_1);
                        return [3 /*break*/, 4];
                    case 3:
                        log.info("initialized provider state");
                        this._state.initialized = true;
                        this.emit("_initialized");
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Internal RPC method. Forwards requests to background via the RPC engine.
     * Also remap ids inbound and outbound
     */
    TorusInPageProvider.prototype._rpcRequest = function (payload, callback, isInternal) {
        var _this = this;
        if (isInternal === void 0) { isInternal = false; }
        var cb = callback;
        var _payload = payload;
        if (!Array.isArray(_payload)) {
            if (!_payload.jsonrpc) {
                _payload.jsonrpc = "2.0";
            }
            if (_payload.method === "casper_accounts" || _payload.method === "casper_requestAccounts") {
                // handle accounts changing
                cb = function (err, res) {
                    _this._handleAccountsChanged(res.result || [], _payload.method === "casper_accounts", isInternal);
                    callback(err, res);
                };
            }
            else if (_payload.method === "wallet_getProviderState") {
                this._rpcEngine.handle(payload, cb);
                return;
            }
        }
        this.tryWindowHandle(_payload, cb);
    };
    /**
     * When the provider becomes connected, updates internal state and emits
     * required events. Idempotent.
     *
     * @param chainId - The ID of the newly connected chain.
     * emits TorusInpageProvider#connect
     */
    TorusInPageProvider.prototype._handleConnect = function (chainId) {
        if (!this._state.isConnected) {
            this._state.isConnected = true;
            this.emit("connect", { chainId: chainId });
            log.debug(messages.info.connected(chainId));
        }
    };
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
    TorusInPageProvider.prototype._handleDisconnect = function (isRecoverable, errorMessage) {
        if (this._state.isConnected || (!this._state.isPermanentlyDisconnected && !isRecoverable)) {
            this._state.isConnected = false;
            var error = void 0;
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
    };
    /**
     * Called when accounts may have changed.
     */
    TorusInPageProvider.prototype._handleAccountsChanged = function (accounts, isEthAccounts, isInternal) {
        if (isEthAccounts === void 0) { isEthAccounts = false; }
        if (isInternal === void 0) { isInternal = false; }
        // defensive programming
        var finalAccounts = accounts;
        if (!Array.isArray(finalAccounts)) {
            log.error("Torus: Received non-array accounts parameter. Please report this bug.", finalAccounts);
            finalAccounts = [];
        }
        for (var _i = 0, accounts_1 = accounts; _i < accounts_1.length; _i++) {
            var account = accounts_1[_i];
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
    };
    /**
     * Upon receipt of a new chainId and networkVersion, emits corresponding
     * events and sets relevant public state.
     * Does nothing if neither the chainId nor the networkVersion are different
     * from existing values.
     *
     * emits TorusInpageProvider#chainChanged
     * @param networkInfo - An object with network info.
     */
    TorusInPageProvider.prototype._handleChainChanged = function (_a) {
        var _b = _a === void 0 ? {} : _a, chainId = _b.chainId;
        if (!chainId) {
            log.error("Torus: Received invalid network parameters. Please report this bug.", { chainId: chainId });
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
    };
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
    TorusInPageProvider.prototype._handleUnlockStateChanged = function (_a) {
        var _b = _a === void 0 ? {} : _a, accounts = _b.accounts, isUnlocked = _b.isUnlocked;
        if (typeof isUnlocked !== "boolean") {
            log.error("Torus: Received invalid isUnlocked parameter. Please report this bug.", { isUnlocked: isUnlocked });
            return;
        }
        if (isUnlocked !== this._state.isUnlocked) {
            this._state.isUnlocked = isUnlocked;
            this._handleAccountsChanged(accounts || []);
        }
    };
    TorusInPageProvider._defaultState = {
        accounts: null,
        isConnected: false,
        isUnlocked: false,
        initialized: false,
        isPermanentlyDisconnected: false,
        hasEmittedConnection: false,
    };
    return TorusInPageProvider;
}(BaseProvider));
export default TorusInPageProvider;
//# sourceMappingURL=inPageProvider.js.map