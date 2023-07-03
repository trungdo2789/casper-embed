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
Object.defineProperty(exports, "__esModule", { value: true });
var openlogin_jrpc_1 = require("@toruslabs/openlogin-jrpc");
var utils_1 = require("./utils");
var PopupHandler = /** @class */ (function (_super) {
    __extends(PopupHandler, _super);
    function PopupHandler(_a) {
        var url = _a.url, target = _a.target, features = _a.features;
        var _this = _super.call(this) || this;
        _this.url = url;
        _this.target = target || "_blank";
        _this.features = features || (0, utils_1.getPopupFeatures)(utils_1.FEATURES_DEFAULT_POPUP_WINDOW);
        _this.window = undefined;
        _this.windowTimer = undefined;
        _this.iClosedWindow = false;
        _this._setupTimer();
        return _this;
    }
    PopupHandler.prototype._setupTimer = function () {
        var _this = this;
        this.windowTimer = Number(setInterval(function () {
            if (_this.window && _this.window.closed) {
                clearInterval(_this.windowTimer);
                if (!_this.iClosedWindow) {
                    _this.emit("close");
                }
                _this.iClosedWindow = false;
                _this.window = undefined;
            }
            if (_this.window === undefined)
                clearInterval(_this.windowTimer);
        }, 500));
    };
    PopupHandler.prototype.open = function () {
        var _a;
        this.window = window.open(this.url.href, this.target, this.features);
        if ((_a = this.window) === null || _a === void 0 ? void 0 : _a.focus)
            this.window.focus();
        return Promise.resolve();
    };
    PopupHandler.prototype.close = function () {
        this.iClosedWindow = true;
        if (this.window)
            this.window.close();
    };
    PopupHandler.prototype.redirect = function (locationReplaceOnRedirect) {
        if (locationReplaceOnRedirect) {
            window.location.replace(this.url.href);
        }
        else {
            window.location.href = this.url.href;
        }
    };
    return PopupHandler;
}(openlogin_jrpc_1.SafeEventEmitter));
exports.default = PopupHandler;
//# sourceMappingURL=PopupHandler.js.map