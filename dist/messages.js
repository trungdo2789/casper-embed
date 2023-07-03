export default {
    errors: {
        disconnected: () => "Torus: Lost connection to Torus.",
        permanentlyDisconnected: () => "Torus: Disconnected from iframe. Page reload required.",
        unsupportedSync: (method) => `Torus: The Torus Ethereum provider does not support synchronous methods like ${method} without a callback parameter.`,
        invalidDuplexStream: () => "Must provide a Node.js-style duplex stream.",
        invalidOptions: (maxEventListeners) => `Invalid options. Received: { maxEventListeners: ${maxEventListeners}}`,
        invalidRequestArgs: () => `Expected a single, non-array, object argument.`,
        invalidRequestMethod: () => `'args.method' must be a non-empty string.`,
        invalidRequestParams: () => `'args.params' must be an object or array if provided.`,
        invalidLoggerObject: () => `'args.logger' must be an object if provided.`,
        invalidLoggerMethod: (method) => `'args.logger' must include required method '${method}'.`,
    },
    info: {
        connected: (chainId) => `Torus: Connected to chain with ID "${chainId}".`,
    },
    warnings: {},
};
//# sourceMappingURL=messages.js.map