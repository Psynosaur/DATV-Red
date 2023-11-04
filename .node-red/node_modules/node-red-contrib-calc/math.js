/**
 * Copyright 2018 Bart Butenaers
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
module.exports = function(RED) {

	function CalculatorNode(config) {
	RED.nodes.createNode(this, config);
        this.inputMsgField  = config.inputMsgField;
        this.outputMsgField = config.outputMsgField;
        this.operation      = config.operation;
        this.constant       = config.constant;
        this.round          = config.round;
        this.decimals       = config.decimals;
    
        var node = this;
        
        // Test if an object contains the specified property (handles multiple levels like obj.a.b.c).
        // (See https://www.customd.com/articles/37/checking-javascript-objects-for-existence-of-a-nested-element )
        function objectHasProperty(obj, prop) {
            var parts = prop.split('.');
            for (var i = 0, l = parts.length; i < l; i++) {
                var part = parts[i];
                if ((obj !== null) && (typeof(obj) === 'object') && (part in obj)) {
                    obj = obj[part];
                }
                else {
                    return false;
                }
            }
            return true;
        }
        
        // https://www.jacklmoore.com/notes/rounding-in-javascript/
        function round(value, decimals) {
            return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
        }
        
        // Check whether the input is correct
        function checkInput(checkNumber, inputValue, minCount, maxCount) {
            var values = [];
            var numbers = [];      
            var isArray = Array.isArray(inputValue);
            
            if (!isArray) {
                if (minCount > 1) {
                    node.error("The msg." + this.inputMsgField + " should be an array");
                    return null;
                }
                
                // Seems we have enough with an array containing a single item
                values.push(inputValue);
            }
            else {
                // Let's check all the numbers in the array
                values = inputValue;
            }
            
            if (maxCount && minCount === maxCount) {
                if (values.length !== minCount) {
                    if (node.constant) {
                        node.error("The msg." + this.inputMsgField + " should be an array with " + (--minCount) + " numbers (because constant value specified)");
                    }
                    else {
                        node.error("The msg." + this.inputMsgField + " should be an array with " + minCount + " numbers");
                    }
                    return null;
                }
            }
            else {
                if (values.length < minCount) {
                    if (node.constant) {
                        node.error("The msg." + this.inputMsgField + " should be an array with minimum " + (--minCount) + " numbers (because constant value specified)");
                    }
                    else {
                        node.error("The msg." + this.inputMsgField + " should be an array with minimum " + minCount + " numbers");
                    }
                    return null;
                }
                if (maxCount && values.length > maxCount) {
                    if (node.constant) {
                        node.error("The msg." + this.inputMsgField + " should be an array with maximum " + (--maxCount) + " numbers (because constant value specified)");
                    }
                    else {
                        node.error("The msg." + this.inputMsgField + " should be an array with maximum " + maxCount + " numbers");
                    }
                    return null;
                }
            }
            
            for (var i = 0; i < values.length; i++) {
                var number = parseFloat(values[i]);
                if (checkNumber && isNaN(number)){
                    node.error("The msg." + this.inputMsgField + " should only contain number(s)");
                    return null;
                }
                numbers.push(number);
            }

            return numbers;
        }
    
        node.on("input", function(msg) {          
            var operation = node.operation;
            var numbers = [];
            var msgKeyValue;
            var count;
            var result;
            
            if (!objectHasProperty(msg, node.inputMsgField)) {
                node.error("The input message doesn't have have a msg." + node.inputMsgField + " field")
                return null;
            }
            
            try {
                msgKeyValue = RED.util.getMessageProperty(msg, node.inputMsgField);
            } 
            catch(err) {
                node.error("The msg." + node.inputMsgField + " field can not be read");
                return;
            }
            
            // Check whether the input data is an arry.
            // Remark: we won't take into account the constant value (below)
            var isArray = Array.isArray(msgKeyValue);

            // When a constant value is specified, this will be appended to the end of the array
            if (node.constant) {
                if (!isArray) {
                    // To be able to append the constantValue (as second value), we need to convert the number to an array with one number
                    msgKeyValue = [ msgKeyValue ];
                }
                
                msgKeyValue.push(parseFloat(node.constant));
            }
                        
            if (!operation || operation === "") {
                operation = msg.operation;
                
                if (!operation) {
                    node.error("An msg.operation should be supplied");
                    return null;
                }
            }
            
            switch(operation) {
                case "abs":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.abs(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "acos":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.acos(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "acosh":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.acosh(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "asin":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.asin(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "asinh":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.asinh(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "atan":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.atan(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "atanh":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.atanh(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "avg":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    result = numbers.reduce(function(a, b) { return a + b; });
                    result = result / numbers.length;
                    break;
                case "cbrt":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.cbrt(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "ceil":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.ceil(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "cos":
                    numbers = checkInput(true, msgKeyValue, 1);
                     if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.cos(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "cosh":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.cosh(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "dec":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = a - 1;
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "div":
                    numbers = checkInput(true, msgKeyValue, 2);
                    if (!numbers) return;
                    
                    if (node.constant === 0) {
                        node.error("The constant value not be 0 (as denominator)");
                        return null;
                    }
                    
                    for (var i = 1; i < numbers.length; i++) {
                        if (numbers[i] === 0) {
                            node.error("The msg." + node.inputMsgField + " should only contain non-zero number(s) for the denominators");
                            return null;
                        }
                    }
                    
                    result = numbers.reduce(function(a, b) { return a / b; });
                    break;
                case "exp":
                    numbers = checkInput(true, msgKeyValue, 1);
                     if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.exp(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "inc":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = a + 1;
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "floor":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.floor(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "log":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.log(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "log10":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.log10(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;      
                case "max":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    result = numbers.reduce(function(a, b) { return (a > b) ? a : b });
                    break;
                case "min":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    result = numbers.reduce(function(a, b) { return (a > b) ? b : a });
                    break;
                case "mult":
                    numbers = checkInput(true, msgKeyValue, 2);
                    if (!numbers) return;
                    result = numbers.reduce(function(a, b) { return a * b; });
                    break;
                case "mod":
                    numbers = checkInput(true, msgKeyValue, 2, 2);
                    if (!numbers) return;
                    result = numbers[0] % numbers[1];
                    break;
                case "pow":
                    numbers = checkInput(true, msgKeyValue, 2, 2);
                    if (!numbers) return;
                    result = Math.pow(numbers[0], numbers[1]);
                    break;                
                case "rand":
                    // When the payload contains an array, then we will generate an array (with same length) of random numbers.
                    // Regardless of the content of the content of the payload array, since we don't need it for our calculations ...
                    if (isArray) {
                        numbers = new Array(msgKeyValue.length);
                    }
                    else {
                        numbers = new Array(1);
                    }
                
                    // Remark: 'forEach' does not work on an un-initialized array
                    for (var j = 0; j < numbers.length; j++) {
                        numbers[j] = Math.random();
                    }
                    result = (isArray) ? numbers : numbers[0];
                    break;
                case "randb":    
                    numbers = checkInput(true, msgKeyValue, 2, 2);
                    if (!numbers) return;
                    result = Math.floor(Math.random() * (numbers[1] - numbers[0] + 1)) + numbers[0];
                    break;
                case "randa":    
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    result = numbers[Math.floor(Math.random() * numbers.length)];
                    break;   
                case "len":    
                    numbers = checkInput(false, msgKeyValue, 1);
                    if (!numbers) return;
                    result = numbers.length;
                    break;                    
                // Implementation of sorting, since the sort node does not behave correctly at this moment.
                // (see https://github.com/akashtalole/node-red-contrib-sort/issues/1)
                case "sorta":    
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.sort(function(a, b) {
                        return a - b;
                    });
                    result = numbers;
                    break;                    
                case "sortd":    
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.sort(function(a, b) {
                        return b - a;
                    });
                    result = numbers;
                    break; 
                case "range":
                    numbers = checkInput(true, msgKeyValue, 2, 2);
                    if (!numbers) return;
                    //numbers[0] = Math.trunc(numbers[0]);
                    //numbers[1] = Math.trunc(numbers[1]);
                    result = [];
                    for (var k = numbers[0]; k <= numbers[1]; k++) {
                        result.push(k);
                    }
                    break;
                case "dist":
                    numbers = checkInput(true, msgKeyValue, 2);
                    if (!numbers) return;  
                    numbers.sort();
                    result = numbers[numbers.length - 1] - numbers[0];
                    break;
                case "rdec":
                    numbers = checkInput(true, msgKeyValue, 2, 2);
                    if (!numbers) return;
                    // See http://www.jacklmoore.com/notes/rounding-in-javascript/
                    result = Number(Math.round(numbers[0] + 'e' + numbers[1]) + 'e-' + numbers[1]);
                    break;
                case "round":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.round(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;  
                case "sin":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.sin(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;  
                case "sinh":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.sinh(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;  
                case "sqrt":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.sqrt(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;  
                case "sum":
                    numbers = checkInput(true, msgKeyValue, 2);
                    if (!numbers) return;
                    result = numbers.reduce(function(a, b) { return a + b; });
                    break;
                case "sub":
                    numbers = checkInput(true, msgKeyValue, 2);
                    if (!numbers) return;
                    result = numbers.reduce(function(a, b) { return a - b; });
                    break;
                case "tan":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.tan(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;  
                case "tanh":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.tanh(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;  
                case "trunc":
                    numbers = checkInput(true, msgKeyValue, 1);
                    if (!numbers) return;
                    numbers.forEach(function(a, index) {
                        numbers[index] = Math.trunc(a);
                    });
                    result = (isArray) ? numbers : numbers[0];
                    break;                
                default:
                    node.error("The msg.operation contains an unsupported operation '" + operation + "'");
                    return null;
            }
            
            // If required, round the result to the specified number of decimals
            if (node.round) {
                if (Array.isArray(result)) {
                    for (var j = 0; j < result.length; j++) {
                        result[j] = round(result[j], node.decimals);
                    }
                }
                else {
                    result = round(result, node.decimals);
                }
            }
            
            RED.util.setMessageProperty(msg, node.outputMsgField, result, true);

            node.send(msg);
        });
    }
  
	RED.nodes.registerType("calculator", CalculatorNode);
}
