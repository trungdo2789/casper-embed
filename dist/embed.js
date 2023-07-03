"use strict";
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
var base_controllers_1 = require("@toruslabs/base-controllers");
var http_helpers_1 = require("@toruslabs/http-helpers");
var openlogin_jrpc_1 = require("@toruslabs/openlogin-jrpc");
var interfaces_1 = require(".//interfaces");
var communicationProvider_1 = __importDefault(require("./communicationProvider"));
var config_1 = __importDefault(require("./config"));
var embedUtils_1 = require("./embedUtils");
var inPageProvider_1 = __importDefault(require("./inPageProvider"));
var loglevel_1 = __importDefault(require("./loglevel"));
var PopupHandler_1 = __importDefault(require("./PopupHandler"));
var siteMetadata_1 = __importDefault(require("./siteMetadata"));
var utils_1 = require("./utils");
var PROVIDER_UNSAFE_METHODS = ["account_put_deploy", "sign_message"];
var COMMUNICATION_UNSAFE_METHODS = [base_controllers_1.COMMUNICATION_JRPC_METHODS.SET_PROVIDER];
var isLocalStorageAvailable = (0, utils_1.storageAvailable)("localStorage");
// preload for iframe doesn't work https://bugs.chromium.org/p/chromium/issues/detail?id=593267
(function preLoadIframe() {
    return __awaiter(this, void 0, void 0, function () {
        var torusIframeHtml, torusUrl, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (typeof document === "undefined")
                        return [2 /*return*/];
                    torusIframeHtml = document.createElement("link");
                    return [4 /*yield*/, (0, utils_1.getTorusUrl)("production")];
                case 1:
                    torusUrl = (_a.sent()).torusUrl;
                    torusIframeHtml.href = "".concat(torusUrl, "/frame");
                    torusIframeHtml.crossOrigin = "anonymous";
                    torusIframeHtml.type = "text/html";
                    torusIframeHtml.rel = "prefetch";
                    if (torusIframeHtml.relList && torusIframeHtml.relList.supports) {
                        if (torusIframeHtml.relList.supports("prefetch")) {
                            document.head.appendChild(torusIframeHtml);
                        }
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    loglevel_1.default.warn(error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
})();
var Torus = /** @class */ (function () {
    function Torus(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.modalZIndex, modalZIndex = _c === void 0 ? 99999 : _c;
        this.torusUrl = "";
        this.isInitialized = false; // init done
        this.requestedLoginProvider = null;
        this.modalZIndex = modalZIndex;
        this.alertZIndex = modalZIndex + 1000;
        this.dappStorageKey = "";
    }
    Torus.prototype.init = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.buildEnv, buildEnv = _c === void 0 ? interfaces_1.TORUS_BUILD_ENV.PRODUCTION : _c, _d = _b.enableLogging, enableLogging = _d === void 0 ? false : _d, network = _b.network, _e = _b.showTorusButton, showTorusButton = _e === void 0 ? false : _e, _f = _b.useLocalStorage, useLocalStorage = _f === void 0 ? false : _f, _g = _b.buttonPosition, buttonPosition = _g === void 0 ? interfaces_1.BUTTON_POSITION.BOTTOM_LEFT : _g, _h = _b.apiKey, apiKey = _h === void 0 ? "torus-default" : _h;
        return __awaiter(this, void 0, void 0, function () {
            var _j, torusUrl, logLevel, dappStorageKey, torusIframeUrl, hashParams, handleSetup;
            var _this = this;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        if (this.isInitialized)
                            throw new Error("Already initialized");
                        (0, http_helpers_1.setAPIKey)(apiKey);
                        return [4 /*yield*/, (0, utils_1.getTorusUrl)(buildEnv)];
                    case 1:
                        _j = _k.sent(), torusUrl = _j.torusUrl, logLevel = _j.logLevel;
                        loglevel_1.default.info(torusUrl, "url loaded");
                        this.torusUrl = torusUrl;
                        loglevel_1.default.setDefaultLevel(logLevel);
                        if (enableLogging)
                            loglevel_1.default.enableAll();
                        else
                            loglevel_1.default.disableAll();
                        dappStorageKey = this.handleDappStorageKey(useLocalStorage);
                        torusIframeUrl = new URL(torusUrl);
                        if (torusIframeUrl.pathname.endsWith("/"))
                            torusIframeUrl.pathname += "frame";
                        else
                            torusIframeUrl.pathname += "/frame";
                        hashParams = new URLSearchParams();
                        if (dappStorageKey)
                            hashParams.append("dappStorageKey", dappStorageKey);
                        hashParams.append("origin", window.location.origin);
                        torusIframeUrl.hash = hashParams.toString();
                        // Iframe code
                        this.torusIframe = (0, embedUtils_1.htmlToElement)("<iframe\n        id=\"torusIframe\"\n        class=\"torusIframe\"\n        src=\"".concat(torusIframeUrl.href, "\"\n        style=\"display: none; position: fixed; top: 0; right: 0; width: 100%;\n        height: 100%; border: none; border-radius: 0; z-index: ").concat(this.modalZIndex.toString(), "\"\n      ></iframe>"));
                        this.torusAlertContainer = (0, embedUtils_1.htmlToElement)("<div id=\"torusAlertContainer\" style=\"display:none; z-index: ".concat(this.alertZIndex.toString(), "\"></div>"));
                        this.styleLink = (0, embedUtils_1.htmlToElement)("<link href=\"".concat(torusUrl, "/css/widget.css\" rel=\"stylesheet\" type=\"text/css\">"));
                        handleSetup = function () {
                            return new Promise(function (resolve, reject) {
                                try {
                                    window.document.head.appendChild(_this.styleLink);
                                    window.document.body.appendChild(_this.torusIframe);
                                    window.document.body.appendChild(_this.torusAlertContainer);
                                    _this.torusIframe.addEventListener("load", function () { return __awaiter(_this, void 0, void 0, function () {
                                        var dappMetadata;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, (0, siteMetadata_1.default)()];
                                                case 1:
                                                    dappMetadata = _a.sent();
                                                    // send init params here
                                                    this.torusIframe.contentWindow.postMessage({
                                                        buttonPosition: buttonPosition,
                                                        apiKey: apiKey,
                                                        network: network,
                                                        dappMetadata: dappMetadata,
                                                    }, torusIframeUrl.origin);
                                                    return [4 /*yield*/, this._setupWeb3({
                                                            torusUrl: torusUrl,
                                                        })];
                                                case 2:
                                                    _a.sent();
                                                    if (showTorusButton)
                                                        this.showTorusButton();
                                                    else
                                                        this.hideTorusButton();
                                                    this.isInitialized = true;
                                                    resolve();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                }
                                catch (error) {
                                    reject(error);
                                }
                            });
                        };
                        return [4 /*yield*/, (0, embedUtils_1.documentReady)()];
                    case 2:
                        _k.sent();
                        return [4 /*yield*/, handleSetup()];
                    case 3:
                        _k.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Torus.prototype.login = function (params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var res, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isInitialized)
                            throw new Error("Call init() first");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        this.requestedLoginProvider = params.loginProvider || null;
                        if (!this.requestedLoginProvider) {
                            this.communicationProvider._displayIframe({ isFull: true });
                        }
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                // We use this method because we want to update inPage provider state with account info
                                _this.provider._rpcRequest({ method: "casper_requestAccounts", params: [_this.requestedLoginProvider, params.login_hint] }, (0, openlogin_jrpc_1.getRpcPromiseCallback)(resolve, reject));
                            })];
                    case 2:
                        res = _a.sent();
                        if (Array.isArray(res) && res.length > 0) {
                            return [2 /*return*/, res];
                        }
                        // This would never happen, but just in case
                        throw new Error("Login failed");
                    case 3:
                        error_2 = _a.sent();
                        loglevel_1.default.error("login failed", error_2);
                        throw error_2;
                    case 4:
                        this.communicationProvider._displayIframe({ isFull: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Torus.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.communicationProvider.isLoggedIn)
                            throw new Error("Not logged in");
                        return [4 /*yield*/, this.communicationProvider.request({
                                method: base_controllers_1.COMMUNICATION_JRPC_METHODS.LOGOUT,
                                params: [],
                            })];
                    case 1:
                        _a.sent();
                        this.requestedLoginProvider = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    Torus.prototype.cleanUp = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.communicationProvider.isLoggedIn) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.logout()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.clearInit();
                        return [2 /*return*/];
                }
            });
        });
    };
    Torus.prototype.clearInit = function () {
        function isElement(element) {
            return element instanceof Element || element instanceof Document;
        }
        if (isElement(this.styleLink) && window.document.body.contains(this.styleLink)) {
            this.styleLink.remove();
            this.styleLink = undefined;
        }
        if (isElement(this.torusIframe) && window.document.body.contains(this.torusIframe)) {
            this.torusIframe.remove();
            this.torusIframe = undefined;
        }
        if (isElement(this.torusAlertContainer) && window.document.body.contains(this.torusAlertContainer)) {
            this.torusAlert = undefined;
            this.torusAlertContainer.remove();
            this.torusAlertContainer = undefined;
        }
        this.isInitialized = false;
    };
    Torus.prototype.hideTorusButton = function () {
        this.communicationProvider.hideTorusButton();
    };
    Torus.prototype.showTorusButton = function () {
        this.communicationProvider.showTorusButton();
    };
    Torus.prototype.setProvider = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.communicationProvider.request({
                            method: base_controllers_1.COMMUNICATION_JRPC_METHODS.SET_PROVIDER,
                            params: __assign({}, params),
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Torus.prototype.showWallet = function (path, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var instanceId, finalPath, finalUrl, walletWindow;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.communicationProvider.request({
                            method: base_controllers_1.COMMUNICATION_JRPC_METHODS.WALLET_INSTANCE_ID,
                            params: [],
                        })];
                    case 1:
                        instanceId = _a.sent();
                        finalPath = path ? "/".concat(path) : "";
                        finalUrl = new URL("".concat(this.torusUrl, "/wallet").concat(finalPath));
                        // Using URL constructor to prevent js injection and allow parameter validation.!
                        finalUrl.searchParams.append("instanceId", instanceId);
                        Object.keys(params).forEach(function (x) {
                            finalUrl.searchParams.append(x, params[x]);
                        });
                        if (this.dappStorageKey) {
                            finalUrl.hash = "#dappStorageKey=".concat(this.dappStorageKey);
                        }
                        walletWindow = new PopupHandler_1.default({ url: finalUrl, features: (0, utils_1.getPopupFeatures)(utils_1.FEATURES_DEFAULT_WALLET_WINDOW) });
                        walletWindow.open();
                        return [2 /*return*/];
                }
            });
        });
    };
    Torus.prototype.getUserInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userInfoResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.communicationProvider.request({
                            method: base_controllers_1.COMMUNICATION_JRPC_METHODS.USER_INFO,
                            params: [],
                        })];
                    case 1:
                        userInfoResponse = _a.sent();
                        return [2 /*return*/, userInfoResponse];
                }
            });
        });
    };
    Torus.prototype.initiateTopup = function (provider, params) {
        return __awaiter(this, void 0, void 0, function () {
            var windowId, topupResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isInitialized)
                            throw new Error("Torus is not initialized");
                        windowId = (0, utils_1.getWindowId)();
                        this.communicationProvider._handleWindow(windowId);
                        return [4 /*yield*/, this.communicationProvider.request({
                                method: base_controllers_1.COMMUNICATION_JRPC_METHODS.TOPUP,
                                params: { provider: provider, params: params, windowId: windowId },
                            })];
                    case 1:
                        topupResponse = _a.sent();
                        return [2 /*return*/, topupResponse];
                }
            });
        });
    };
    Torus.prototype.signMessage = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var signMessageRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isInitialized)
                            throw new Error("Torus is not initialized");
                        return [4 /*yield*/, this.provider.request({
                                method: "sign_message",
                                params: __assign({}, params),
                            })];
                    case 1:
                        signMessageRes = _a.sent();
                        return [2 /*return*/, signMessageRes];
                }
            });
        });
    };
    Torus.prototype._setupWeb3 = function (providerParams) {
        return __awaiter(this, void 0, void 0, function () {
            var providerStream, communicationStream, inPageProvider, communicationProvider, detectAccountRequestPrototypeModifier, proxiedInPageProvider, proxiedCommunicationProvider;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loglevel_1.default.info("setupWeb3 running");
                        providerStream = new openlogin_jrpc_1.BasePostMessageStream({
                            name: "embed_torus",
                            target: "iframe_torus",
                            targetWindow: this.torusIframe.contentWindow,
                            targetOrigin: providerParams.torusUrl,
                        });
                        communicationStream = new openlogin_jrpc_1.BasePostMessageStream({
                            name: "embed_communication",
                            target: "iframe_communication",
                            targetWindow: this.torusIframe.contentWindow,
                            targetOrigin: providerParams.torusUrl,
                        });
                        inPageProvider = new inPageProvider_1.default(providerStream, {});
                        communicationProvider = new communicationProvider_1.default(communicationStream, {});
                        inPageProvider.tryWindowHandle = function (payload, cb) {
                            var _payload = payload;
                            if (!Array.isArray(_payload) && PROVIDER_UNSAFE_METHODS.includes(_payload.method)) {
                                var windowId = (0, utils_1.getWindowId)();
                                communicationProvider._handleWindow(windowId, {
                                    target: "_blank",
                                    features: (0, utils_1.getPopupFeatures)(utils_1.FEATURES_CONFIRM_WINDOW),
                                });
                                // for inPageProvider methods sending windowId in request instead of params
                                // as params might be positional.
                                _payload.windowId = windowId;
                            }
                            inPageProvider._rpcEngine.handle(_payload, cb);
                        };
                        communicationProvider.tryWindowHandle = function (payload, cb) {
                            var _payload = payload;
                            if (!Array.isArray(_payload) && COMMUNICATION_UNSAFE_METHODS.includes(_payload.method)) {
                                var windowId = (0, utils_1.getWindowId)();
                                communicationProvider._handleWindow(windowId, {
                                    target: "_blank",
                                    features: (0, utils_1.getPopupFeatures)(utils_1.FEATURES_PROVIDER_CHANGE_WINDOW), // todo: are these features generic for all
                                });
                                // for communication methods sending window id in jrpc req params
                                _payload.params.windowId = windowId;
                            }
                            communicationProvider._rpcEngine.handle(_payload, cb);
                        };
                        detectAccountRequestPrototypeModifier = function (m) {
                            var originalMethod = inPageProvider[m];
                            // eslint-disable-next-line @typescript-eslint/no-this-alias
                            var self = _this;
                            inPageProvider[m] = function providerFunc(request, cb) {
                                var method = request.method, _a = request.params, params = _a === void 0 ? [] : _a;
                                if (method === "casper_requestAccounts") {
                                    if (!cb)
                                        return self.login({ loginProvider: params[0] });
                                    self
                                        .login({ loginProvider: params[0] })
                                        // eslint-disable-next-line promise/no-callback-in-promise
                                        .then(function (res) { return cb(null, res); })
                                        // eslint-disable-next-line promise/no-callback-in-promise
                                        .catch(function (err) { return cb(err); });
                                }
                                return originalMethod.apply(this, [request, cb]);
                            };
                        };
                        // Detects call to casper_requestAccounts in request & sendAsync and passes to login
                        detectAccountRequestPrototypeModifier("request");
                        detectAccountRequestPrototypeModifier("sendAsync");
                        detectAccountRequestPrototypeModifier("send");
                        proxiedInPageProvider = new Proxy(inPageProvider, {
                            // straight up lie that we deleted the property so that it doesn't
                            // throw an error in strict mode
                            deleteProperty: function () { return true; },
                        });
                        proxiedCommunicationProvider = new Proxy(communicationProvider, {
                            // straight up lie that we deleted the property so that it doesn't
                            // throw an error in strict mode
                            deleteProperty: function () { return true; },
                        });
                        this.provider = proxiedInPageProvider;
                        this.communicationProvider = proxiedCommunicationProvider;
                        return [4 /*yield*/, Promise.all([
                                inPageProvider._initializeState(),
                                communicationProvider._initializeState(__assign(__assign({}, providerParams), { dappStorageKey: this.dappStorageKey, torusAlertContainer: this.torusAlertContainer, torusIframe: this.torusIframe })),
                            ])];
                    case 1:
                        _a.sent();
                        loglevel_1.default.debug("Torus - injected provider");
                        return [2 /*return*/];
                }
            });
        });
    };
    Torus.prototype.handleDappStorageKey = function (useLocalStorage) {
        var dappStorageKey = "";
        if (isLocalStorageAvailable && useLocalStorage) {
            var storedKey = window.localStorage.getItem(config_1.default.localStorageKey);
            if (storedKey)
                dappStorageKey = storedKey;
            else {
                var generatedKey = "torus-app-".concat((0, utils_1.getWindowId)());
                window.localStorage.setItem(config_1.default.localStorageKey, generatedKey);
                dappStorageKey = generatedKey;
            }
        }
        this.dappStorageKey = dappStorageKey;
        return dappStorageKey;
    };
    return Torus;
}());
exports.default = Torus;
//# sourceMappingURL=embed.js.map