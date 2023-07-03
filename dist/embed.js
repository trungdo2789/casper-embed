var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { COMMUNICATION_JRPC_METHODS } from "@toruslabs/base-controllers";
import { setAPIKey } from "@toruslabs/http-helpers";
import { BasePostMessageStream, getRpcPromiseCallback } from "@toruslabs/openlogin-jrpc";
import { BUTTON_POSITION, TORUS_BUILD_ENV, } from ".//interfaces";
import TorusCommunicationProvider from "./communicationProvider";
import configuration from "./config";
import { documentReady, htmlToElement } from "./embedUtils";
import TorusInPageProvider from "./inPageProvider";
import log from "./loglevel";
import PopupHandler from "./PopupHandler";
import getSiteMetadata from "./siteMetadata";
import { FEATURES_CONFIRM_WINDOW, FEATURES_DEFAULT_WALLET_WINDOW, FEATURES_PROVIDER_CHANGE_WINDOW, getPopupFeatures, getTorusUrl, getWindowId, storageAvailable, } from "./utils";
const PROVIDER_UNSAFE_METHODS = ["account_put_deploy", "sign_message"];
const COMMUNICATION_UNSAFE_METHODS = [COMMUNICATION_JRPC_METHODS.SET_PROVIDER];
const isLocalStorageAvailable = storageAvailable("localStorage");
// preload for iframe doesn't work https://bugs.chromium.org/p/chromium/issues/detail?id=593267
(function preLoadIframe() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (typeof document === "undefined")
                return;
            const torusIframeHtml = document.createElement("link");
            const { torusUrl } = yield getTorusUrl("production");
            torusIframeHtml.href = `${torusUrl}/frame`;
            torusIframeHtml.crossOrigin = "anonymous";
            torusIframeHtml.type = "text/html";
            torusIframeHtml.rel = "prefetch";
            if (torusIframeHtml.relList && torusIframeHtml.relList.supports) {
                if (torusIframeHtml.relList.supports("prefetch")) {
                    document.head.appendChild(torusIframeHtml);
                }
            }
        }
        catch (error) {
            log.warn(error);
        }
    });
})();
class Torus {
    constructor({ modalZIndex = 99999 } = {}) {
        this.torusUrl = "";
        this.isInitialized = false; // init done
        this.requestedLoginProvider = null;
        this.modalZIndex = modalZIndex;
        this.alertZIndex = modalZIndex + 1000;
        this.dappStorageKey = "";
    }
    init({ buildEnv = TORUS_BUILD_ENV.PRODUCTION, enableLogging = false, network, showTorusButton = false, useLocalStorage = false, buttonPosition = BUTTON_POSITION.BOTTOM_LEFT, apiKey = "torus-default", } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isInitialized)
                throw new Error("Already initialized");
            setAPIKey(apiKey);
            const { torusUrl, logLevel } = yield getTorusUrl(buildEnv);
            log.info(torusUrl, "url loaded");
            this.torusUrl = torusUrl;
            log.setDefaultLevel(logLevel);
            if (enableLogging)
                log.enableAll();
            else
                log.disableAll();
            const dappStorageKey = this.handleDappStorageKey(useLocalStorage);
            const torusIframeUrl = new URL(torusUrl);
            if (torusIframeUrl.pathname.endsWith("/"))
                torusIframeUrl.pathname += "frame";
            else
                torusIframeUrl.pathname += "/frame";
            const hashParams = new URLSearchParams();
            if (dappStorageKey)
                hashParams.append("dappStorageKey", dappStorageKey);
            hashParams.append("origin", window.location.origin);
            torusIframeUrl.hash = hashParams.toString();
            // Iframe code
            this.torusIframe = htmlToElement(`<iframe
        id="torusIframe"
        class="torusIframe"
        src="${torusIframeUrl.href}"
        style="display: none; position: fixed; top: 0; right: 0; width: 100%;
        height: 100%; border: none; border-radius: 0; z-index: ${this.modalZIndex.toString()}"
      ></iframe>`);
            this.torusAlertContainer = htmlToElement(`<div id="torusAlertContainer" style="display:none; z-index: ${this.alertZIndex.toString()}"></div>`);
            this.styleLink = htmlToElement(`<link href="${torusUrl}/css/widget.css" rel="stylesheet" type="text/css">`);
            const handleSetup = () => {
                return new Promise((resolve, reject) => {
                    try {
                        window.document.head.appendChild(this.styleLink);
                        window.document.body.appendChild(this.torusIframe);
                        window.document.body.appendChild(this.torusAlertContainer);
                        this.torusIframe.addEventListener("load", () => __awaiter(this, void 0, void 0, function* () {
                            const dappMetadata = yield getSiteMetadata();
                            // send init params here
                            this.torusIframe.contentWindow.postMessage({
                                buttonPosition,
                                apiKey,
                                network,
                                dappMetadata,
                            }, torusIframeUrl.origin);
                            yield this._setupWeb3({
                                torusUrl,
                            });
                            if (showTorusButton)
                                this.showTorusButton();
                            else
                                this.hideTorusButton();
                            this.isInitialized = true;
                            resolve();
                        }));
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            };
            yield documentReady();
            yield handleSetup();
        });
    }
    login(params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInitialized)
                throw new Error("Call init() first");
            try {
                this.requestedLoginProvider = params.loginProvider || null;
                if (!this.requestedLoginProvider) {
                    this.communicationProvider._displayIframe({ isFull: true });
                }
                // If user is already logged in, we assume they have given access to the website
                const res = yield new Promise((resolve, reject) => {
                    // We use this method because we want to update inPage provider state with account info
                    this.provider._rpcRequest({ method: "casper_requestAccounts", params: [this.requestedLoginProvider, params.login_hint] }, getRpcPromiseCallback(resolve, reject));
                });
                if (Array.isArray(res) && res.length > 0) {
                    return res;
                }
                // This would never happen, but just in case
                throw new Error("Login failed");
            }
            catch (error) {
                log.error("login failed", error);
                throw error;
            }
            finally {
                this.communicationProvider._displayIframe({ isFull: false });
            }
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.communicationProvider.isLoggedIn)
                throw new Error("Not logged in");
            yield this.communicationProvider.request({
                method: COMMUNICATION_JRPC_METHODS.LOGOUT,
                params: [],
            });
            this.requestedLoginProvider = null;
        });
    }
    cleanUp() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.communicationProvider.isLoggedIn) {
                yield this.logout();
            }
            this.clearInit();
        });
    }
    clearInit() {
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
    }
    hideTorusButton() {
        this.communicationProvider.hideTorusButton();
    }
    showTorusButton() {
        this.communicationProvider.showTorusButton();
    }
    setProvider(params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.communicationProvider.request({
                method: COMMUNICATION_JRPC_METHODS.SET_PROVIDER,
                params: Object.assign({}, params),
            });
        });
    }
    showWallet(path, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const instanceId = yield this.communicationProvider.request({
                method: COMMUNICATION_JRPC_METHODS.WALLET_INSTANCE_ID,
                params: [],
            });
            const finalPath = path ? `/${path}` : "";
            const finalUrl = new URL(`${this.torusUrl}/wallet${finalPath}`);
            // Using URL constructor to prevent js injection and allow parameter validation.!
            finalUrl.searchParams.append("instanceId", instanceId);
            Object.keys(params).forEach((x) => {
                finalUrl.searchParams.append(x, params[x]);
            });
            if (this.dappStorageKey) {
                finalUrl.hash = `#dappStorageKey=${this.dappStorageKey}`;
            }
            // No need to track this window state. Hence, no _handleWindow call.
            const walletWindow = new PopupHandler({ url: finalUrl, features: getPopupFeatures(FEATURES_DEFAULT_WALLET_WINDOW) });
            walletWindow.open();
        });
    }
    getUserInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const userInfoResponse = yield this.communicationProvider.request({
                method: COMMUNICATION_JRPC_METHODS.USER_INFO,
                params: [],
            });
            return userInfoResponse;
        });
    }
    initiateTopup(provider, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInitialized)
                throw new Error("Torus is not initialized");
            const windowId = getWindowId();
            this.communicationProvider._handleWindow(windowId);
            const topupResponse = yield this.communicationProvider.request({
                method: COMMUNICATION_JRPC_METHODS.TOPUP,
                params: { provider, params, windowId },
            });
            return topupResponse;
        });
    }
    signMessage(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInitialized)
                throw new Error("Torus is not initialized");
            const signMessageRes = yield this.provider.request({
                method: "sign_message",
                params: Object.assign({}, params),
            });
            return signMessageRes;
        });
    }
    _setupWeb3(providerParams) {
        return __awaiter(this, void 0, void 0, function* () {
            log.info("setupWeb3 running");
            // setup background connection
            const providerStream = new BasePostMessageStream({
                name: "embed_torus",
                target: "iframe_torus",
                targetWindow: this.torusIframe.contentWindow,
                targetOrigin: providerParams.torusUrl,
            });
            // We create another LocalMessageDuplexStream for communication between dapp <> iframe
            const communicationStream = new BasePostMessageStream({
                name: "embed_communication",
                target: "iframe_communication",
                targetWindow: this.torusIframe.contentWindow,
                targetOrigin: providerParams.torusUrl,
            });
            // compose the inPage provider
            const inPageProvider = new TorusInPageProvider(providerStream, {});
            const communicationProvider = new TorusCommunicationProvider(communicationStream, {});
            inPageProvider.tryWindowHandle = (payload, cb) => {
                const _payload = payload;
                if (!Array.isArray(_payload) && PROVIDER_UNSAFE_METHODS.includes(_payload.method)) {
                    const windowId = getWindowId();
                    communicationProvider._handleWindow(windowId, {
                        target: "_blank",
                        features: getPopupFeatures(FEATURES_CONFIRM_WINDOW),
                    });
                    // for inPageProvider methods sending windowId in request instead of params
                    // as params might be positional.
                    _payload.windowId = windowId;
                }
                inPageProvider._rpcEngine.handle(_payload, cb);
            };
            communicationProvider.tryWindowHandle = (payload, cb) => {
                const _payload = payload;
                if (!Array.isArray(_payload) && COMMUNICATION_UNSAFE_METHODS.includes(_payload.method)) {
                    const windowId = getWindowId();
                    communicationProvider._handleWindow(windowId, {
                        target: "_blank",
                        features: getPopupFeatures(FEATURES_PROVIDER_CHANGE_WINDOW), // todo: are these features generic for all
                    });
                    // for communication methods sending window id in jrpc req params
                    _payload.params.windowId = windowId;
                }
                communicationProvider._rpcEngine.handle(_payload, cb);
            };
            // detect casper_requestAccounts and pipe to enable for now
            const detectAccountRequestPrototypeModifier = (m) => {
                const originalMethod = inPageProvider[m];
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const self = this;
                inPageProvider[m] = function providerFunc(request, cb) {
                    const { method, params = [] } = request;
                    if (method === "casper_requestAccounts") {
                        if (!cb)
                            return self.login({ loginProvider: params[0] });
                        self
                            .login({ loginProvider: params[0] })
                            // eslint-disable-next-line promise/no-callback-in-promise
                            .then((res) => cb(null, res))
                            // eslint-disable-next-line promise/no-callback-in-promise
                            .catch((err) => cb(err));
                    }
                    return originalMethod.apply(this, [request, cb]);
                };
            };
            // Detects call to casper_requestAccounts in request & sendAsync and passes to login
            detectAccountRequestPrototypeModifier("request");
            detectAccountRequestPrototypeModifier("sendAsync");
            detectAccountRequestPrototypeModifier("send");
            const proxiedInPageProvider = new Proxy(inPageProvider, {
                // straight up lie that we deleted the property so that it doesn't
                // throw an error in strict mode
                deleteProperty: () => true,
            });
            const proxiedCommunicationProvider = new Proxy(communicationProvider, {
                // straight up lie that we deleted the property so that it doesn't
                // throw an error in strict mode
                deleteProperty: () => true,
            });
            this.provider = proxiedInPageProvider;
            this.communicationProvider = proxiedCommunicationProvider;
            yield Promise.all([
                inPageProvider._initializeState(),
                communicationProvider._initializeState(Object.assign(Object.assign({}, providerParams), { dappStorageKey: this.dappStorageKey, torusAlertContainer: this.torusAlertContainer, torusIframe: this.torusIframe })),
            ]);
            log.debug("Torus - injected provider");
        });
    }
    handleDappStorageKey(useLocalStorage) {
        let dappStorageKey = "";
        if (isLocalStorageAvailable && useLocalStorage) {
            const storedKey = window.localStorage.getItem(configuration.localStorageKey);
            if (storedKey)
                dappStorageKey = storedKey;
            else {
                const generatedKey = `torus-app-${getWindowId()}`;
                window.localStorage.setItem(configuration.localStorageKey, generatedKey);
                dappStorageKey = generatedKey;
            }
        }
        this.dappStorageKey = dappStorageKey;
        return dappStorageKey;
    }
}
export default Torus;
//# sourceMappingURL=embed.js.map