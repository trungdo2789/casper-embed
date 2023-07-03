var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const handleEvent = (handle, eventName, handler, ...handlerArgs) => {
    const handlerWrapper = () => {
        handler(...handlerArgs);
        handle.removeEventListener(eventName, handlerWrapper);
    };
    handle.addEventListener(eventName, handlerWrapper);
};
export function documentReady() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            if (document.readyState !== "loading") {
                resolve();
            }
            else {
                handleEvent(document, "DOMContentLoaded", resolve);
            }
        });
    });
}
export const htmlToElement = (html) => {
    const template = window.document.createElement("template");
    const trimmedHtml = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = trimmedHtml;
    return template.content.firstChild;
};
//# sourceMappingURL=embedUtils.js.map