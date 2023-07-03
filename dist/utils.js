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
    return function (req, res, next) {
        // json-rpc-engine will terminate the request when it notices this error
        if (typeof req.method !== "string" || !req.method) {
            res.error = rpcErrors.invalidRequest({
                message: "The request 'method' must be a non-empty string.",
                data: __assign(__assign({}, (req || {})), { cause: "The request 'method' must be a non-empty string." }),
            });
        }
        next(function (done) {
            var error = res.error;
            if (!error) {
                return done();
            }
            log.error("Torus - RPC Error: ".concat(error.message), error);
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
    var warningMsg = "Torus: Lost connection to \"".concat(remoteLabel, "\".");
    if (error === null || error === void 0 ? void 0 : error.stack) {
        warningMsg += "\n".concat(error.stack);
    }
    log.warn(warningMsg);
    if (emitter && emitter.listenerCount("error") > 0) {
        emitter.emit("error", warningMsg);
    }
}
export var getWindowId = function () { return Math.random().toString(36).slice(2); };
export var getTorusUrl = function (buildEnv) { return __awaiter(void 0, void 0, void 0, function () {
    var torusUrl, logLevel;
    return __generator(this, function (_a) {
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
                torusUrl = "https://casper.tor.us";
                logLevel = "error";
                break;
        }
        return [2 /*return*/, { torusUrl: torusUrl, logLevel: logLevel }];
    });
}); };
export var getUserLanguage = function () {
    var userLanguage = window.navigator.language || "en-US";
    var userLanguages = userLanguage.split("-");
    userLanguage = Object.prototype.hasOwnProperty.call(config.translations, userLanguages[0]) ? userLanguages[0] : "en";
    return userLanguage;
};
export var NOOP = function () {
    // empty function
};
export var FEATURES_PROVIDER_CHANGE_WINDOW = { height: 660, width: 375 };
export var FEATURES_DEFAULT_WALLET_WINDOW = { height: 740, width: 1315 };
export var FEATURES_DEFAULT_POPUP_WINDOW = { height: 700, width: 1200 };
export var FEATURES_CONFIRM_WINDOW = { height: 700, width: 450 };
export function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = "__storage_test__";
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
export function getPopupFeatures(_a) {
    var w = _a.width, h = _a.height;
    // Fixes dual-screen position                             Most browsers      Firefox
    var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    var dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;
    var width = window.innerWidth
        ? window.innerWidth
        : document.documentElement.clientWidth
            ? document.documentElement.clientWidth
            : window.screen.width;
    var height = window.innerHeight
        ? window.innerHeight
        : document.documentElement.clientHeight
            ? document.documentElement.clientHeight
            : window.screen.height;
    var systemZoom = 1; // No reliable estimate
    var left = Math.abs((width - w) / 2 / systemZoom + dualScreenLeft);
    var top = Math.abs((height - h) / 2 / systemZoom + dualScreenTop);
    var features = "titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=".concat(h / systemZoom, ",width=").concat(w / systemZoom, ",top=").concat(top, ",left=").concat(left);
    return features;
}
//# sourceMappingURL=utils.js.map