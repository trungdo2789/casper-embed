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
import config from "./config";
import log from "./loglevel";
// utility functions
/**
 * json-rpc-engine middleware that logs RPC errors and and validates req.method.
 *
 * @param log - The logging API to use.
 * @returns  json-rpc-engine middleware function
 */
export function createErrorMiddleware() {
    return (req, res, next) => {
        // json-rpc-engine will terminate the request when it notices this error
        if (typeof req.method !== "string" || !req.method) {
            res.error = rpcErrors.invalidRequest({
                message: `The request 'method' must be a non-empty string.`,
                data: Object.assign(Object.assign({}, (req || {})), { cause: `The request 'method' must be a non-empty string.` }),
            });
        }
        next((done) => {
            const { error } = res;
            if (!error) {
                return done();
            }
            log.error(`Torus - RPC Error: ${error.message}`, error);
            return done();
        });
    };
}
/**
 * Logs a stream disconnection error. Emits an 'error' if given an
 * EventEmitter that has listeners for the 'error' event.
 *
 * @param log - The logging API to use.
 * @param remoteLabel - The label of the disconnected stream.
 * @param error - The associated error to log.
 * @param emitter - The logging API to use.
 */
export function logStreamDisconnectWarning(remoteLabel, error, emitter) {
    let warningMsg = `Torus: Lost connection to "${remoteLabel}".`;
    if (error === null || error === void 0 ? void 0 : error.stack) {
        warningMsg += `\n${error.stack}`;
    }
    log.warn(warningMsg);
    if (emitter && emitter.listenerCount("error") > 0) {
        emitter.emit("error", warningMsg);
    }
}
export const getWindowId = () => Math.random().toString(36).slice(2);
export const getTorusUrl = (buildEnv) => __awaiter(void 0, void 0, void 0, function* () {
    let torusUrl;
    let logLevel;
    // const versionUsed = version;
    // log.info("casper embed version used: ", versionUsed);
    switch (buildEnv) {
        case "testing":
            torusUrl = "https://casper-testing.tor.us";
            logLevel = "debug";
            break;
        case "development":
            torusUrl = "http://localhost:4050";
            logLevel = "debug";
            break;
        default:
            torusUrl = `https://casper.tor.us`;
            logLevel = "error";
            break;
    }
    return { torusUrl, logLevel };
});
export const getUserLanguage = () => {
    let userLanguage = window.navigator.language || "en-US";
    const userLanguages = userLanguage.split("-");
    userLanguage = Object.prototype.hasOwnProperty.call(config.translations, userLanguages[0]) ? userLanguages[0] : "en";
    return userLanguage;
};
export const NOOP = () => {
    // empty function
};
export const FEATURES_PROVIDER_CHANGE_WINDOW = { height: 660, width: 375 };
export const FEATURES_DEFAULT_WALLET_WINDOW = { height: 740, width: 1315 };
export const FEATURES_DEFAULT_POPUP_WINDOW = { height: 700, width: 1200 };
export const FEATURES_CONFIRM_WINDOW = { height: 700, width: 450 };
export function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return (e &&
            // everything except Firefox
            (e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === "QuotaExceededError" ||
                // Firefox
                e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0);
    }
}
/**
 * popup handler utils
 */
export function getPopupFeatures({ width: w, height: h }) {
    // Fixes dual-screen position                             Most browsers      Firefox
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;
    const width = window.innerWidth
        ? window.innerWidth
        : document.documentElement.clientWidth
            ? document.documentElement.clientWidth
            : window.screen.width;
    const height = window.innerHeight
        ? window.innerHeight
        : document.documentElement.clientHeight
            ? document.documentElement.clientHeight
            : window.screen.height;
    const systemZoom = 1; // No reliable estimate
    const left = Math.abs((width - w) / 2 / systemZoom + dualScreenLeft);
    const top = Math.abs((height - h) / 2 / systemZoom + dualScreenTop);
    const features = `titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=${h / systemZoom},width=${w / systemZoom},top=${top},left=${left}`;
    return features;
}
//# sourceMappingURL=utils.js.map