export default {
    errors: {
        disconnected: function () { return "Torus: Lost connection to Torus."; },
        permanentlyDisconnected: function () { return "Torus: Disconnected from iframe. Page reload required."; },
        unsupportedSync: function (method) {
            return "Torus: The Torus Ethereum provider does not support synchronous methods like ".concat(method, " without a callback parameter.");
        },
        invalidDuplexStream: function () { return "Must provide a Node.js-style duplex stream."; },
        invalidOptions: function (maxEventListeners) { return "Invalid options. Received: { maxEventListeners: ".concat(maxEventListeners, "}"); },
        invalidRequestArgs: function () { return "Expected a single, non-array, object argument."; },
        invalidRequestMethod: function () { return "'args.method' must be a non-empty string."; },
        invalidRequestParams: function () { return "'args.params' must be an object or array if provided."; },
        invalidLoggerObject: function () { return "'args.logger' must be an object if provided."; },
        invalidLoggerMethod: function (method) { return "'args.logger' must include required method '".concat(method, "'."); },
    },
    info: {
        connected: function (chainId) { return "Torus: Connected to chain with ID \"".concat(chainId, "\"."); },
    },
    warnings: {},
};
//# sourceMappingURL=messages.js.map