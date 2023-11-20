"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initController = exports.beforeEmitFactory = void 0;
const miscellanious_1 = require("./miscellanious");
const getColorForValue = (colorForValue, value, RED) => {
    let color, found = false;
    try {
        if (Array.isArray(colorForValue)) {
            for (let index = 0; index < colorForValue.length; index++) {
                const compareWith = colorForValue[index];
                if (RED.util.compareObjects(compareWith.value, value)) {
                    color = compareWith.color;
                    found = true;
                    break;
                }
            }
        }
        else if (typeof colorForValue === 'object') {
            color = colorForValue[value];
            found = color !== undefined && color !== null;
        }
    }
    catch (_error) {
        // TODO: Not an error to receive an unaccounted for value, but we should log to Node-RED debug log
        // console.log("Error trying to find color for value '" + value + "'", error)
    }
    if (found === false || color === undefined) {
        color = 'gray';
    }
    return [color, found];
};
const beforeEmitFactory = (node, RED) => {
    return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    msg, value) => {
        if (node.allowColorForValueInMessage === true &&
            typeof msg.colorForValue !== 'undefined') {
            const ledMsg = msg;
            const msgColorForValue = ledMsg.colorForValue;
            if (msgColorForValue !== undefined) {
                node.overrideColorForValue = msgColorForValue;
            }
        }
        const colorForValue = node.overrideColorForValue || node.colorForValue;
        const [color, glow] = getColorForValue(colorForValue, value, RED);
        return {
            msg: {
                ...msg,
                color,
                glow: node.showGlow ? glow : false,
                sizeMultiplier: node.height
            }
        };
    };
};
exports.beforeEmitFactory = beforeEmitFactory;
// TODO: why is initController stringed and evaled??? we have to move erryone into this file :/
const initController = ($scope, _events) => {
    $scope.flag = true;
    // TODO: From miscellanious.ts, we need to resolve this issue
    // Based on: https://stackoverflow.com/a/14570614
    const observeDOMFactory = () => {
        const MutationObserver = window.MutationObserver || miscellanious_1.WebKitMutationObserver;
        return (observe, callback) => {
            if (!observe) {
                throw new Error('Element to observe not provided');
            }
            if (observe.nodeType !== 1 &&
                observe.nodeType !== 9 &&
                observe.nodeType !== 11) {
                throw new Error('Unexpected Node type (' + observe.nodeType + ') provided: ' + observe);
            }
            if (MutationObserver) {
                const observer = new MutationObserver((mutations, observer) => {
                    observer.disconnect();
                    callback(mutations);
                });
                observer.observe(observe, {
                    childList: true,
                    subtree: true
                });
            }
            else if (window.addEventListener !== undefined) {
                const options = {
                    capture: false,
                    once: true
                };
                observe.addEventListener('DOMNodeInserted', callback, options);
                observe.addEventListener('DOMNodeRemoved', callback, options);
            }
        };
    };
    const glowSize = 7;
    const ledStyle = (color, glow, sizeMultiplier) => {
        if (glow) {
            return `
      background-color: ${color};
      box-shadow:
        #0000009e 0 0px ${2 / window.devicePixelRatio}px 0px,
        ${color} 0 0px ${glowSize * sizeMultiplier}px ${Math.floor((glowSize * sizeMultiplier) / 3)}px,
      inset #00000017 0 -1px 1px 0px;`;
        }
        else {
            // TODO: duplicate code because of execution scope, fix this shit :|
            return `
      background-color: ${color}; 
      box-shadow:
        #0000009e 0 0px ${2 / window.devicePixelRatio}px 0px,
        inset #ffffff8c 0px 1px 2px,
        inset #00000033 0 -1px 1px 0px,
        inset ${color} 0 -1px 2px;`;
        }
    };
    const update = (msg, element) => {
        if (!msg) {
            return;
        }
        if (!element) {
            return;
        }
        const color = msg.color;
        const glow = msg.glow;
        const sizeMultiplier = msg.sizeMultiplier;
        $(element).attr('style', ledStyle(color, glow, sizeMultiplier));
    };
    const retrieveElementFromDocument = (id, document) => {
        // TODO: share code to make sure we're always using the same id composure
        const elementId = 'led_' + id;
        if (!document) {
            return undefined;
        }
        return document.getElementById(elementId);
    };
    const observeDOM = observeDOMFactory();
    const updateWithScope = (msg) => {
        if (!$scope) {
            return;
        }
        const id = $scope.$eval('$id');
        const attemptUpdate = () => {
            const element = retrieveElementFromDocument(id, document);
            if (element) {
                update(msg, element);
            }
            else {
                // HACK: is there a proper way to wait for this node's element to be rendered?
                observeDOM(document, (_change) => {
                    attemptUpdate();
                });
            }
        };
        attemptUpdate();
    };
    $scope.$watch('msg', updateWithScope);
};
exports.initController = initController;
//# sourceMappingURL=processing.js.map