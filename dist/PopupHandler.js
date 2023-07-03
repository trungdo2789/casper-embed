import { SafeEventEmitter } from "@toruslabs/openlogin-jrpc";
import { FEATURES_DEFAULT_POPUP_WINDOW, getPopupFeatures } from "./utils";
class PopupHandler extends SafeEventEmitter {
    constructor({ url, target, features }) {
        super();
        this.url = url;
        this.target = target || "_blank";
        this.features = features || getPopupFeatures(FEATURES_DEFAULT_POPUP_WINDOW);
        this.window = undefined;
        this.windowTimer = undefined;
        this.iClosedWindow = false;
        this._setupTimer();
    }
    _setupTimer() {
        this.windowTimer = Number(setInterval(() => {
            if (this.window && this.window.closed) {
                clearInterval(this.windowTimer);
                if (!this.iClosedWindow) {
                    this.emit("close");
                }
                this.iClosedWindow = false;
                this.window = undefined;
            }
            if (this.window === undefined)
                clearInterval(this.windowTimer);
        }, 500));
    }
    open() {
        var _a;
        this.window = window.open(this.url.href, this.target, this.features);
        if ((_a = this.window) === null || _a === void 0 ? void 0 : _a.focus)
            this.window.focus();
        return Promise.resolve();
    }
    close() {
        this.iClosedWindow = true;
        if (this.window)
            this.window.close();
    }
    redirect(locationReplaceOnRedirect) {
        if (locationReplaceOnRedirect) {
            window.location.replace(this.url.href);
        }
        else {
            window.location.href = this.url.href;
        }
    }
}
export default PopupHandler;
//# sourceMappingURL=PopupHandler.js.map