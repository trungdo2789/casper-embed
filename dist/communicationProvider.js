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
import { COMMUNICATION_JRPC_METHODS, COMMUNICATION_NOTIFICATIONS } from "@toruslabs/base-controllers";
import BaseProvider from "./baseProvider";
import configuration from "./config";
import { documentReady, htmlToElement } from "./embedUtils";
import { BUTTON_POSITION, } from "./interfaces";
import log from "./loglevel";
import messages from "./messages";
import PopupHandler from "./PopupHandler";
import { FEATURES_CONFIRM_WINDOW, getPopupFeatures, getUserLanguage } from "./utils";
/**
 * @param connectionStream - A Node.js duplex stream
 * @param  opts - An options bag
 */
var TorusCommunicationProvider = /** @class */ (function (_super) {
    __extends(TorusCommunicationProvider, _super);
    function TorusCommunicationProvider(connectionStream, _a) {
        var _b = _a.maxEventListeners, maxEventListeners = _b === void 0 ? 100 : _b, _c = _a.jsonRpcStreamName, jsonRpcStreamName = _c === void 0 ? "provider" : _c;
        var _this = _super.call(this, connectionStream, { maxEventListeners: maxEventListeners, jsonRpcStreamName: jsonRpcStreamName }) || this;
        // private state
        _this._state = __assign({}, TorusCommunicationProvider._defaultState);
        // public state
        _this.torusUrl = "";
        _this.dappStorageKey = "";
        var languageTranslations = configuration.translations[getUserLanguage()];
        _this.embedTranslations = languageTranslations.embed;
        _this.windowRefs = {};
        // setup own event listeners
        // EIP-1193 connect
        _this.on("connect", function () {
            _this._state.isConnected = true;
        });
        var notificationHandler = function (payload) {
            var method = payload.method, params = payload.params;
            if (method === COMMUNICATION_NOTIFICATIONS.IFRAME_STATUS) {
                var _a = params, isFullScreen = _a.isFullScreen, rid = _a.rid;
                _this._displayIframe({ isFull: isFullScreen, rid: rid });
            }
            else if (method === COMMUNICATION_NOTIFICATIONS.CREATE_WINDOW) {
                var _b = params, windowId = _b.windowId, url = _b.url;
                _this._createPopupBlockAlert(windowId, url);
            }
            else if (method === COMMUNICATION_NOTIFICATIONS.CLOSE_WINDOW) {
                _this._handleCloseWindow(params);
            }
            else if (method === COMMUNICATION_NOTIFICATIONS.USER_LOGGED_IN) {
                var currentLoginProvider = params.currentLoginProvider;
                _this._state.isLoggedIn = true;
                _this._state.currentLoginProvider = currentLoginProvider;
            }
            else if (method === COMMUNICATION_NOTIFICATIONS.USER_LOGGED_OUT) {
                _this._state.isLoggedIn = false;
                _this._state.currentLoginProvider = null;
                _this._displayIframe();
            }
        };
        _this.jsonRpcConnectionEvents.on("notification", notificationHandler);
        return _this;
    }
    Object.defineProperty(TorusCommunicationProvider.prototype, "isLoggedIn", {
        get: function () {
            return this._state.isLoggedIn;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TorusCommunicationProvider.prototype, "isIFrameFullScreen", {
        get: function () {
            return this._state.isIFrameFullScreen;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns whether the inPage provider is connected to Torus.
     */
    TorusCommunicationProvider.prototype.isConnected = function () {
        return this._state.isConnected;
    };
    TorusCommunicationProvider.prototype._initializeState = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var torusUrl, dappStorageKey, torusAlertContainer, torusIframe, _a, currentLoginProvider, isLoggedIn, error_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, 3, 4]);
                        torusUrl = params.torusUrl, dappStorageKey = params.dappStorageKey, torusAlertContainer = params.torusAlertContainer, torusIframe = params.torusIframe;
                        this.torusUrl = torusUrl;
                        this.dappStorageKey = dappStorageKey;
                        this.torusAlertContainer = torusAlertContainer;
                        this.torusIframe = torusIframe;
                        this.torusIframe.addEventListener("load", function () {
                            // only do this if iframe is not full screen
                            if (!_this._state.isIFrameFullScreen)
                                _this._displayIframe();
                        });
                        return [4 /*yield*/, this.request({
                                method: COMMUNICATION_JRPC_METHODS.GET_PROVIDER_STATE,
                                params: [],
                            })];
                    case 1:
                        _a = (_b.sent()), currentLoginProvider = _a.currentLoginProvider, isLoggedIn = _a.isLoggedIn;
                        // indicate that we've connected, for EIP-1193 compliance
                        this._handleConnect(currentLoginProvider, isLoggedIn);
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _b.sent();
                        log.error("Torus: Failed to get initial state. Please report this bug.", error_1);
                        return [3 /*break*/, 4];
                    case 3:
                        log.info("initialized communication state");
                        this._state.initialized = true;
                        this.emit("_initialized");
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TorusCommunicationProvider.prototype._handleWindow = function (windowId, _a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, url = _b.url, target = _b.target, features = _b.features;
        var finalUrl = new URL(url || "".concat(this.torusUrl, "/redirect?windowId=").concat(windowId));
        if (this.dappStorageKey) {
            // If multiple instances, it returns the first one
            if (finalUrl.hash)
                finalUrl.hash += "&dappStorageKey=".concat(this.dappStorageKey);
            else
                finalUrl.hash = "#dappStorageKey=".concat(this.dappStorageKey);
        }
        var handledWindow = new PopupHandler({ url: finalUrl, target: target, features: features });
        handledWindow.open();
        if (!handledWindow.window) {
            this._createPopupBlockAlert(windowId, finalUrl.href);
            return;
        }
        // Add to collection only if window is opened
        this.windowRefs[windowId] = handledWindow;
        // We tell the iframe that the window has been successfully opened
        this.request({
            method: COMMUNICATION_JRPC_METHODS.OPENED_WINDOW,
            params: { windowId: windowId },
        });
        handledWindow.once("close", function () {
            // user closed the window
            delete _this.windowRefs[windowId];
            _this.request({
                method: COMMUNICATION_JRPC_METHODS.CLOSED_WINDOW,
                params: { windowId: windowId },
            });
        });
    };
    TorusCommunicationProvider.prototype._displayIframe = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.isFull, isFull = _c === void 0 ? false : _c, _d = _b.rid, rid = _d === void 0 ? "" : _d;
        var style = {};
        // set phase
        if (!isFull) {
            style.display = this._state.torusWidgetVisibility ? "block" : "none";
            style.height = "70px";
            style.width = "70px";
            switch (this._state.buttonPosition) {
                case BUTTON_POSITION.TOP_LEFT:
                    style.top = "0px";
                    style.left = "0px";
                    style.right = "auto";
                    style.bottom = "auto";
                    break;
                case BUTTON_POSITION.TOP_RIGHT:
                    style.top = "0px";
                    style.right = "0px";
                    style.left = "auto";
                    style.bottom = "auto";
                    break;
                case BUTTON_POSITION.BOTTOM_RIGHT:
                    style.bottom = "0px";
                    style.right = "0px";
                    style.top = "auto";
                    style.left = "auto";
                    break;
                case BUTTON_POSITION.BOTTOM_LEFT:
                default:
                    style.bottom = "0px";
                    style.left = "0px";
                    style.top = "auto";
                    style.right = "auto";
                    break;
            }
        }
        else {
            style.display = "block";
            style.width = "100%";
            style.height = "100%";
            style.top = "0px";
            style.right = "0px";
            style.left = "0px";
            style.bottom = "0px";
        }
        Object.assign(this.torusIframe.style, style);
        this._state.isIFrameFullScreen = isFull;
        this.request({
            method: COMMUNICATION_JRPC_METHODS.IFRAME_STATUS,
            params: { isIFrameFullScreen: isFull, rid: rid },
        });
    };
    TorusCommunicationProvider.prototype.hideTorusButton = function () {
        this._state.torusWidgetVisibility = false;
        this._displayIframe();
    };
    TorusCommunicationProvider.prototype.showTorusButton = function () {
        this._state.torusWidgetVisibility = true;
        this._displayIframe();
    };
    /**
     * Internal RPC method. Forwards requests to background via the RPC engine.
     * Also remap ids inbound and outbound
     */
    TorusCommunicationProvider.prototype._rpcRequest = function (payload, callback) {
        var cb = callback;
        var _payload = payload;
        if (!Array.isArray(_payload)) {
            if (!_payload.jsonrpc) {
                _payload.jsonrpc = "2.0";
            }
        }
        this.tryWindowHandle(_payload, cb);
    };
    /**
     * When the provider becomes connected, updates internal state and emits
     * required events. Idempotent.
     *
     * @param currentLoginProvider - The login Provider
     * emits TorusInpageProvider#connect
     */
    TorusCommunicationProvider.prototype._handleConnect = function (currentLoginProvider, isLoggedIn) {
        if (!this._state.isConnected) {
            this._state.isConnected = true;
            this.emit("connect", { currentLoginProvider: currentLoginProvider, isLoggedIn: isLoggedIn });
            log.debug(messages.info.connected(currentLoginProvider));
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
    TorusCommunicationProvider.prototype._handleDisconnect = function (isRecoverable, errorMessage) {
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
                this._state.currentLoginProvider = null;
                this._state.isLoggedIn = false;
                this._state.torusWidgetVisibility = false;
                this._state.isIFrameFullScreen = false;
                this._state.isPermanentlyDisconnected = true;
            }
            this.emit("disconnect", error);
        }
    };
    // Called if the iframe wants to close the window cause it is done processing the request
    TorusCommunicationProvider.prototype._handleCloseWindow = function (params) {
        var windowId = params.windowId;
        if (this.windowRefs[windowId]) {
            this.windowRefs[windowId].close();
            delete this.windowRefs[windowId];
        }
    };
    TorusCommunicationProvider.prototype._createPopupBlockAlert = function (windowId, url) {
        return __awaiter(this, void 0, void 0, function () {
            var logoUrl, torusAlert, successAlert, btnContainer, bindOnLoad, attachOnLoad;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logoUrl = this.getLogoUrl();
                        torusAlert = htmlToElement('<div id="torusAlert" class="torus-alert--v2">' +
                            "<div id=\"torusAlert__logo\"><img src=\"".concat(logoUrl, "\" /></div>") +
                            "<div>" +
                            "<h1 id=\"torusAlert__title\">".concat(this.embedTranslations.actionRequired, "</h1>") +
                            "<p id=\"torusAlert__desc\">".concat(this.embedTranslations.pendingAction, "</p>") +
                            "</div>" +
                            "</div>");
                        successAlert = htmlToElement("<div><a id=\"torusAlert__btn\">".concat(this.embedTranslations.continue, "</a></div>"));
                        btnContainer = htmlToElement('<div id="torusAlert__btn-container"></div>');
                        btnContainer.appendChild(successAlert);
                        torusAlert.appendChild(btnContainer);
                        bindOnLoad = function () {
                            successAlert.addEventListener("click", function () {
                                _this._handleWindow(windowId, {
                                    url: url,
                                    target: "_blank",
                                    features: getPopupFeatures(FEATURES_CONFIRM_WINDOW),
                                });
                                torusAlert.remove();
                                if (_this.torusAlertContainer.children.length === 0)
                                    _this.torusAlertContainer.style.display = "none";
                            });
                        };
                        attachOnLoad = function () {
                            _this.torusAlertContainer.appendChild(torusAlert);
                        };
                        return [4 /*yield*/, documentReady()];
                    case 1:
                        _a.sent();
                        attachOnLoad();
                        bindOnLoad();
                        this.torusAlertContainer.style.display = "block";
                        return [2 /*return*/];
                }
            });
        });
    };
    TorusCommunicationProvider.prototype.getLogoUrl = function () {
        var logoUrl = "".concat(this.torusUrl, "/images/torus_icon-blue.svg");
        return logoUrl;
    };
    TorusCommunicationProvider._defaultState = {
        buttonPosition: "bottom-left",
        currentLoginProvider: null,
        isIFrameFullScreen: false,
        hasEmittedConnection: false,
        torusWidgetVisibility: false,
        initialized: false,
        isLoggedIn: false,
        isPermanentlyDisconnected: false,
        isConnected: false,
    };
    return TorusCommunicationProvider;
}(BaseProvider));
export default TorusCommunicationProvider;
//# sourceMappingURL=communicationProvider.js.map