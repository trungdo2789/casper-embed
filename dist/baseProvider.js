"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var rpc_errors_1 = require("@metamask/rpc-errors");
var base_controllers_1 = require("@toruslabs/base-controllers");
var openlogin_jrpc_1 = require("@toruslabs/openlogin-jrpc");
var is_stream_1 = require("is-stream");
var pump_1 = __importDefault(require("pump"));
var messages_1 = __importDefault(require("./messages"));
var utils_1 = require("./utils");
/**
 * @param connectionStream - A Node.js duplex stream
 * @param opts - An options bag
 */
var BaseProvider = /** @class */ (function (_super) {
    __extends(BaseProvider, _super);
    function BaseProvider(connectionStream, _a) {
        var _b = _a.maxEventListeners, maxEventListeners = _b === void 0 ? 100 : _b, _c = _a.jsonRpcStreamName, jsonRpcStreamName = _c === void 0 ? "provider" : _c;
        var _this = _super.call(this) || this;
        if (!(0, is_stream_1.isDuplexStream)(connectionStream)) {
            throw new Error(messages_1.default.errors.invalidDuplexStream());
        }
        _this.isTorus = true;
        _this.setMaxListeners(maxEventListeners);
        _this._handleConnect = _this._handleConnect.bind(_this);
        _this._handleDisconnect = _this._handleDisconnect.bind(_this);
        _this._handleStreamDisconnect = _this._handleStreamDisconnect.bind(_this);
        _this._rpcRequest = _this._rpcRequest.bind(_this);
        _this._initializeState = _this._initializeState.bind(_this);
        _this.request = _this.request.bind(_this);
        _this.sendAsync = _this.sendAsync.bind(_this);
        // this.enable = this.enable.bind(this);
        // setup connectionStream multiplexing
        var mux = new openlogin_jrpc_1.ObjectMultiplex();
        (0, pump_1.default)(connectionStream, mux, connectionStream, _this._handleStreamDisconnect.bind(_this, "Torus"));
        // ignore phishing warning message (handled elsewhere)
        mux.ignoreStream("phishing");
        // setup own event listeners
        // connect to async provider
        var jsonRpcConnection = (0, openlogin_jrpc_1.createStreamMiddleware)();
        (0, pump_1.default)(jsonRpcConnection.stream, mux.createStream(jsonRpcStreamName), jsonRpcConnection.stream, _this._handleStreamDisconnect.bind(_this, "Torus RpcProvider"));
        // handle RPC requests via dapp-side rpc engine
        var rpcEngine = new openlogin_jrpc_1.JRPCEngine();
        rpcEngine.push((0, openlogin_jrpc_1.createIdRemapMiddleware)());
        rpcEngine.push((0, utils_1.createErrorMiddleware)());
        rpcEngine.push((0, base_controllers_1.createLoggerMiddleware)({ origin: location.origin }));
        rpcEngine.push(jsonRpcConnection.middleware);
        _this._rpcEngine = rpcEngine;
        _this.jsonRpcConnectionEvents = jsonRpcConnection.events;
        return _this;
    }
    /**
     * Submits an RPC request for the given method, with the given params.
     * Resolves with the result of the method call, or rejects on error.
     *
     * @param args - The RPC request arguments.
     * @returns A Promise that resolves with the result of the RPC method,
     * or rejects if an error is encountered.
     */
    BaseProvider.prototype.request = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var method, params;
            var _this = this;
            return __generator(this, function (_a) {
                if (!args || typeof args !== "object" || Array.isArray(args)) {
                    throw rpc_errors_1.rpcErrors.invalidRequest({
                        message: messages_1.default.errors.invalidRequestArgs(),
                        data: __assign(__assign({}, (args || {})), { cause: messages_1.default.errors.invalidRequestArgs() }),
                    });
                }
                method = args.method, params = args.params;
                if (typeof method !== "string" || method.length === 0) {
                    throw rpc_errors_1.rpcErrors.invalidRequest({
                        message: messages_1.default.errors.invalidRequestMethod(),
                        data: __assign(__assign({}, (args || {})), { cause: messages_1.default.errors.invalidRequestArgs() }),
                    });
                }
                if (params !== undefined && !Array.isArray(params) && (typeof params !== "object" || params === null)) {
                    throw rpc_errors_1.rpcErrors.invalidRequest({
                        message: messages_1.default.errors.invalidRequestParams(),
                        data: __assign(__assign({}, (args || {})), { cause: messages_1.default.errors.invalidRequestArgs() }),
                    });
                }
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this._rpcRequest({ method: method, params: params }, (0, openlogin_jrpc_1.getRpcPromiseCallback)(resolve, reject));
                    })];
            });
        });
    };
    /**
     * Submits an RPC request per the given JSON-RPC request object.
     *
     * @param payload - The RPC request object.
     * @param cb - The callback function.
     */
    BaseProvider.prototype.send = function (payload, callback) {
        this._rpcRequest(payload, callback);
    };
    /**
     * Submits an RPC request per the given JSON-RPC request object.
     *
     * @param payload - The RPC request object.
     * @param cb - The callback function.
     */
    BaseProvider.prototype.sendAsync = function (payload) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._rpcRequest(payload, (0, openlogin_jrpc_1.getRpcPromiseCallback)(resolve, reject));
        });
    };
    /**
     * Called when connection is lost to critical streams.
     *
     * emits TorusInpageProvider#disconnect
     */
    BaseProvider.prototype._handleStreamDisconnect = function (streamName, error) {
        (0, utils_1.logStreamDisconnectWarning)(streamName, error, this);
        this._handleDisconnect(false, error ? error.message : undefined);
    };
    return BaseProvider;
}(openlogin_jrpc_1.SafeEventEmitter));
exports.default = BaseProvider;
//# sourceMappingURL=baseProvider.js.map