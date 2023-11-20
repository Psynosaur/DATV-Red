"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapColorForValue = exports.nodeToStringFactory = exports.checkConfig = void 0;
/**
 * Check for that we have a config instance and that our config instance has a group selected, otherwise report an error
 * @param {object} config - The config instance
 * @param {object} node - The node to report the error on
 * @returns {boolean} `false` if we encounter an error, otherwise `true`
 */
const checkConfig = (config, node, RED) => {
    if (!config) {
        // TODO: have to think further if it makes sense to separate these out, it isn't clear what the user can do if they encounter this besides use the explicit error to more clearly debug the code
        node.error(RED._('ui_led.error.no-config'));
        return false;
    }
    if (!config.group) {
        node.error(RED._('ui_led.error.no-group'));
        return false;
    }
    if (RED.nodes.getNode(config.group) === undefined) {
        node.error(RED._('ui_led.error.invalid-group'));
        return false;
    }
    return true;
};
exports.checkConfig = checkConfig;
const nodeToStringFactory = (config) => {
    return () => {
        let result = 'LED';
        if (config.name) {
            result += ' name: ' + config.label;
        }
        if (config.label) {
            result += ' label: ' + config.label;
        }
        return result;
    };
};
exports.nodeToStringFactory = nodeToStringFactory;
// TODO: should we be doing this at message time? less performant but does it allow config changes where doing before doesn't?
const mapColorForValue = (node, config, RED) => {
    return config.map((value) => {
        return {
            color: value.color,
            value: RED.util.evaluateNodeProperty(value.value, value.valueType, node, {}),
            valueType: value.valueType
        };
    });
};
exports.mapColorForValue = mapColorForValue;
//# sourceMappingURL=utility.js.map