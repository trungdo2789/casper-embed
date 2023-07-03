var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { rpcErrors } from "@metamask/rpc-errors";
import { createLoggerMiddleware } from "@toruslabs/base-controllers";
import { createIdRemapMiddleware, createStreamMiddleware, getRpcPromiseCallback, JRPCEngine, ObjectMultiplex, SafeEventEmitter, } from "@toruslabs/openlogin-jrpc";
import { isDuplexStream } from "is-stream";
import pump from "pump";
import messages from "./messages";
import { createErrorMiddleware, logStreamDisconnectWarning } from "./utils";
/**
 * @param connectionStream - A Node.js duplex stream
 * @param opts - An options bag
 */
class BaseProvider extends SafeEventEmitter {
    constructor(connectionStream, { maxEventListeners = 100, jsonRpcStreamName = "provider" }) {
        super();
        if (!isDuplexStream(connectionStream)) {
            throw new Error(messages.errors.invalidDuplexStream());
        }
        this.isTorus = true;
        this.setMaxListeners(maxEventListeners);
        this._handleConnect = this._handleConnect.bind(this);
        this._handleDisconnect = this._handleDisconnect.bind(this);
        this._handleStreamDisconnect = this._handleStreamDisconnect.bind(this);
        this._rpcRequest = this._rpcRequest.bind(this);
        this._initializeState = this._initializeState.bind(this);
        this.request = this.request.bind(this);
        this.sendAsync = this.sendAsync.bind(this);
        // this.enable = this.enable.bind(this);
        // setup connectionStream multiplexing
        const mux = new ObjectMultiplex();
        pump(connectionStream, mux, connectionStream, this._handleStreamDisconnect.bind(this, "Torus"));
        // ignore phishing warning message (handled elsewhere)
        mux.ignoreStream("phishing");
        // setup own event listeners
        // connect to async provider
        const jsonRpcConnection = createStreamMiddleware();
        pump(jsonRpcConnection.stream, mux.createStream(jsonRpcStreamName), jsonRpcConnection.stream, this._handleStreamDisconnect.bind(this, "Torus RpcProvider"));
        // handle RPC requests via dapp-side rpc engine
        const rpcEngine = new JRPCEngine();
        rpcEngine.push(createIdRemapMiddleware());
        rpcEngine.push(createErrorMiddleware());
        rpcEngine.push(createLoggerMiddleware({ origin: location.origin }));
        rpcEngine.push(jsonRpcConnection.middleware);
        this._rpcEngine = rpcEngine;
        this.jsonRpcConnectionEvents = jsonRpcConnection.events;
    }
    /**
     * Submits an RPC request for the given method, with the given params.
     * Resolves with the result of the method call, or rejects on error.
     *
     * @param args - The RPC request arguments.
     * @returns A Promise that resolves with the result of the RPC method,
     * or rejects if an error is encountered.
     */
    request(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!args || typeof args !== "object" || Array.isArray(args)) {
                throw rpcErrors.invalidRequest({
                    message: messages.errors.invalidRequestArgs(),
                    data: Object.assign(Object.assign({}, (args || {})), { cause: messages.errors.invalidRequestArgs() }),
                });
            }
            const { method, params } = args;
            if (typeof method !== "string" || method.length === 0) {
                throw rpcErrors.invalidRequest({
                    message: messages.errors.invalidRequestMethod(),
                    data: Object.assign(Object.assign({}, (args || {})), { cause: messages.errors.invalidRequestArgs() }),
                });
            }
            if (params !== undefined && !Array.isArray(params) && (typeof params !== "object" || params === null)) {
                throw rpcErrors.invalidRequest({
                    message: messages.errors.invalidRequestParams(),
                    data: Object.assign(Object.assign({}, (args || {})), { cause: messages.errors.invalidRequestArgs() }),
                });
            }
            return new Promise((resolve, reject) => {
                this._rpcRequest({ method, params }, getRpcPromiseCallback(resolve, reject));
            });
        });
    }
    /**
     * Submits an RPC request per the given JSON-RPC request object.
     *
     * @param payload - The RPC request object.
     * @param cb - The callback function.
     */
    send(payload, callback) {
        this._rpcRequest(payload, callback);
    }
    /**
     * Submits an RPC request per the given JSON-RPC request object.
     *
     * @param payload - The RPC request object.
     * @param cb - The callback function.
     */
    sendAsync(payload) {
        return new Promise((resolve, reject) => {
            this._rpcRequest(payload, getRpcPromiseCallback(resolve, reject));
        });
    }
    /**
     * Called when connection is lost to critical streams.
     *
     * emits TorusInpageProvider#disconnect
     */
    _handleStreamDisconnect(streamName, error) {
        logStreamDisconnectWarning(streamName, error, this);
        this._handleDisconnect(false, error ? error.message : undefined);
    }
}
export default BaseProvider;
//# sourceMappingURL=baseProvider.js.map