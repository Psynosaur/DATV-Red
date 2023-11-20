"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryForInt = exports.guaranteeInt = void 0;
const guaranteeInt = (value, fallback, base = 10) => {
    const maybeInt = exports.tryForInt(value, base);
    if (typeof maybeInt === 'number') {
        return maybeInt;
    }
    return fallback;
};
exports.guaranteeInt = guaranteeInt;
const tryForInt = (value, base = 10) => {
    if (typeof value === 'number') {
        return Math.floor(value);
    }
    if (typeof value === 'string') {
        try {
            return parseInt(value, base);
        }
        catch (_error) {
            return undefined;
        }
    }
    return undefined;
};
exports.tryForInt = tryForInt;
//# sourceMappingURL=utility.js.map