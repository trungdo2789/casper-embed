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
/**
 * Returns whether the given image URL exists
 * @param url - the url of the image
 * @returns whether the image exists
 */
function imgExists(url) {
    return new Promise(function (resolve, reject) {
        try {
            var img = document.createElement("img");
            img.onload = function () { return resolve(true); };
            img.onerror = function () { return resolve(false); };
            img.src = url;
        }
        catch (e) {
            reject(e);
        }
    });
}
/**
 * Extracts a name for the site from the DOM
 */
var getSiteName = function (window) {
    var document = window.document;
    var siteName = document.querySelector('head > meta[property="og:site_name"]');
    if (siteName) {
        return siteName.content;
    }
    var metaTitle = document.querySelector('head > meta[name="title"]');
    if (metaTitle) {
        return metaTitle.content;
    }
    if (document.title && document.title.length > 0) {
        return document.title;
    }
    return window.location.hostname;
};
/**
 * Extracts an icon for the site from the DOM
 */
function getSiteIcon(window) {
    return __awaiter(this, void 0, void 0, function () {
        var document_1, icon, _a, _b, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    document_1 = window.document;
                    icon = document_1.querySelector('head > link[rel="shortcut icon"]');
                    _a = icon;
                    if (!_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, imgExists(icon.href)];
                case 1:
                    _a = (_c.sent());
                    _c.label = 2;
                case 2:
                    if (_a) {
                        return [2 /*return*/, icon.href];
                    }
                    // Search through available icons in no particular order
                    icon = Array.from(document_1.querySelectorAll('head > link[rel="icon"]')).find(function (_icon) { return Boolean(_icon.href); });
                    _b = icon;
                    if (!_b) return [3 /*break*/, 4];
                    return [4 /*yield*/, imgExists(icon.href)];
                case 3:
                    _b = (_c.sent());
                    _c.label = 4;
                case 4:
                    if (_b) {
                        return [2 /*return*/, icon.href];
                    }
                    return [2 /*return*/, ""];
                case 5:
                    error_1 = _c.sent();
                    return [2 /*return*/, ""];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets site metadata and returns it
 *
 */
var getSiteMetadata = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = {
                    name: getSiteName(window)
                };
                return [4 /*yield*/, getSiteIcon(window)];
            case 1: return [2 /*return*/, (_a.icon = _b.sent(),
                    _a)];
        }
    });
}); };
export default getSiteMetadata;
//# sourceMappingURL=siteMetadata.js.map