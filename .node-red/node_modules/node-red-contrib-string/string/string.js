module.exports = function(RED) {
    var S = require('string');
    function string(config) {
        RED.nodes.createNode(this, config);
        this.on('input', function(msg) {
            var globalContext = this.context().global;
            var flowContext = this.context().flow;

            // Decode typeInput value by type/value
            function getTypeInputValue(t, v) {
              var r = '';
              switch(t) {
                case "msg":
                  r = RED.util.getMessageProperty(msg, v);
                  break;
                case "flow":
                  r = flowContext.get(v);
                  break;
                case "global":
                  r = globalContext.get(v);
                  break;
                case "str":
                  try {
                    r = unescape(JSON.parse('"'+v+'"'));;
                  }catch(e){
                    r = v;
                  }
                  break;
                case "num":
                  r = parseFloat(v);
                  break;
                case "json":
                  if (v !== '') {
                    r = JSON.parse(v);
                  }else{
                    r = undefined;
                  }
              }
              return r;
            }

            // We could use eval, but this is the safest way to do things
            function executeFunctionByName(functionName, context, args) {
                var namespaces = functionName.split(".");
                var func = namespaces.pop();
                for(var i = 0; i < namespaces.length; i++) {
                    context = context[namespaces[i]];
                }
                return context[func].apply(context, args);
            }

            // Apply methods to value
            var value = getTypeInputValue(config.object, config.prop);
            value = S(value);
            if (config.methods) {
              config.methods.forEach(function(m, i) {
                switch(m.name) {
                  case 'toString':
                    value = S(value.toString());
                    break;
                  case 'decodeURIComponent':
                    value = S(decodeURIComponent(value.toString()));
                    break;
                  case 'encodeURIComponent':
                    value = S(encodeURIComponent(value.toString()));
                    break;
                  case 'length':
                    value = value.toString().length;
                    break;
                  default:
                    var args = [];
                    m.params.forEach(function(p, i) {
                      args.push(getTypeInputValue(p.type, p.value));
                    });
                    value = executeFunctionByName(m.name, value, args);
                }
              });
            }
            if (value.s) {
              value = value.s;
            }

            // // Assign value to given object property
            switch(config.objectout) {
              case "msg":
                RED.util.setMessageProperty(msg, config.propout, value);
                break;
              case "flow":
                flowContext.set(config.propout, value);
                break;
              case "global":
                globalContext.set(config.propout, value);
                break;
            }

            // Pass the original message object along
            this.send(msg);
        });
    }
    RED.nodes.registerType("string", string);
}
