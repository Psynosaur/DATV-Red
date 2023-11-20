"use strict";
const processing_1 = require("./processing");
const rendering_1 = require("./rendering");
const utility_1 = require("./shared/utility");
const utility_2 = require("./utility");
const nodeInit = (RED) => {
    function LEDNodeConstructor(config) {
        try {
            const NodeREDDashboard = RED.require('node-red-dashboard');
            if (!NodeREDDashboard) {
                throw new Error('Node-RED dashboard is a peer requirement of this library, please install it via npm or in the palette panel.');
            }
            RED.nodes.createNode(this, config);
            if (!utility_2.checkConfig(config, this, RED)) {
                return;
            }
            this.colorForValue = utility_2.mapColorForValue(this, config.colorForValue, RED);
            this.allowColorForValueInMessage = config.allowColorForValueInMessage;
            this.showGlow = config.showGlow !== undefined ? config.showGlow : true;
            this.toString = utility_2.nodeToStringFactory(config);
            // TODO: support theme and dark
            const ui = NodeREDDashboard(RED);
            const groupNode = RED.nodes.getNode(config.group);
            const width = utility_1.tryForInt(config.width) ||
                (config.group && groupNode.config.width) ||
                undefined;
            const height = utility_1.guaranteeInt(config.height, 1) || 1;
            const format = rendering_1.HTML(config, 'gray', false, height);
            this.height = height;
            const done = ui.addWidget({
                node: this,
                width,
                height,
                format,
                templateScope: 'local',
                order: config.order,
                group: config.group,
                emitOnlyNewValues: false,
                beforeEmit: processing_1.beforeEmitFactory(this, RED),
                initController: processing_1.initController
            });
            this.on('close', done);
        }
        catch (error) {
            console.log(error);
        }
    }
    RED.nodes.registerType('ui_led', LEDNodeConstructor);
};
module.exports = nodeInit;
//# sourceMappingURL=ui_led.js.map