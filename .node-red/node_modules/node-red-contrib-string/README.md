# node-red-contrib-string
Provides a node with native and extended chainable JavaScript string parsing
and manipulation methods. The node is a high level wrapper for the concise and
lightweight [stringjs.com](http://stringjs.com) object and uses Node-RED's editor UI to create easy
chaining. Additional string parsing functionality and compatibility have been
added from the [fork](https://github.com/Steveorevo/string.js).

Applies string methods from a given context property and assigns the results
optionally to the same or another context property. Methods can be chained by
adding multiple methods sequentially and with parameters that are literal or
from other context properties. The string object always passes along the msg
object with (if any) changes applied.

By default, string "from" and "to" apply to the `msg.payload` property but may
be set to any property of `global`, `flow`, or `msg` contexts.

## Examples

#### Data Extraction - Get Technical FAX
Methods can be chained within the UI enabling complex and versatile parsing
functionality. Here we can see how easy it is to extract the technical FAX phone
number WhoIS information:

![Node-RED Example](/string/demo/parsed-whois.png?raw=true "Parse WhoIS for Technical FAX")

Consider the given WhoIS dump from a command line console (see image below).
We will want to obtain the FAX number (outlined in the dashed yellow). The string
node will extract the technical FAX phone number by first removing the header,
followed by all data up to the phrase "Technical:". This ensures that we don't
accidentally obtain a FAX number from another section. Lastly, the string node
grabs the number from between the markers "Fax:" and a carriage return and
displays the output in the Node-RED debug window.

![WhoIS Commandline Dump](/string/demo/technical-fax.png?raw=true "Raw Commandline Dump from WhoIS")

The extraction is performed using JavaScript's unique ability to chain actions on
a given object such as the native String object or the popular jQuery component.
This unique contribution to Node-RED furnishes a lightweight and enhanced version
of string parsing functions. The visual representation in the first image could be
coded by hand in JavaScript (after including all the dependencies) as:
```
console.log(
  msg.payload.getRightMost('%')
             .delLeftMost('Technical:')
             .between('FAX:', '\n')
);
```

#### Validate Phone Number
Furthermore, a single string node could have the properties set to perform data
validation. In this simple example we'll perform some conditional checks to
see if the phone number is numeric and furnish a friendly error message if it is
not. Consider the following flow:

![Validate Phone Number](/string/demo/validate-phone.png?raw=true "Validate Phone Number")

Let's take a look at the string node titled "Verify Number" (see image below).
The properties for the node have been configured to use the methods
`stripPunctuation` and `isNumeric` which will result in a boolean true or false.
Next, we convert the boolean to a string using `toString`. Lastly, we use the
`replaceAll` methods to convert the only two boolean possibilities to the
original number as found in property msg.payload or the informative error message
 _"Error! Not a valid number."_.

![Verify Number Node](/string/demo/validate-node-properties.png?raw=true "Verify Number properties")

### Using String in Node-RED Function Nodes
You can use the string object's methods inside Node-RED's function nodes. The
dependency string.js for Node.js will have already been installed if you included
the string node in your palette. This would allow you to use the parsing methods
in JavaScript such as:

```
  // Always change the last word to World
  var greet = S("Hello Mars");
  msg.payload = greet.delRightMost(" ").append("World");
```

There are several easy ways to make the string object's methods available in your
JavaScript function nodes:

#### Include String Node in Flow
A simple way is to just include the string node in your flow before the Node-RED
function node. The string node will normally return a native JavaScript string
datatype; however, if you use the setValue method with no value, a string.js
object can be casted into a readily available property. In our example below we
cast the object into `msg.string`.

![Using String in JavaScript](/string/demo/use-in-function.png?raw=true "Using String in JavaScript")

The string object returns an instance of itself when using the setValue method.
You can then write JavaScript to instantiate a copy of the string object.

```
var S = function(x) {
  return msg.string.setValue(x);
}
msg.payload = S("Hello World");
```

#### Enable Require in Node-RED
An alternative method to use the string object is to enable the require method
by updating Node-RED's settings.js to enable Node.js' "require" ability.

https://github.com/node-red/node-red/issues/41#issuecomment-325554335

```
functionGlobalContext: {
    require:require,
    // os:require('os'),
    // octalbonescript:require('octalbonescript'),
    // jfive:require("johnny-five"),
    // j5board:require("johnny-five").Board({repl:false})
},
```
This will essentially give Node-RED's function node the ability to include any
arbitrary Node.js library which you may or may not desire. Likewise, you could
just update Node-RED's settings.js to just enable the string.js library by
modifying the functionGlobalContext to read:
```
functionGlobalContext: {
    string:require("string")
},
```

Your Node-RED's function node could then instantiate a string object like so:
```
var S = global.get("string");
msg.payload = S("Hello World");
```

## Installation
Run the following command in your Node-RED user directory (typically ~/.node-red):

    npm install node-red-contrib-string

The string node will appear in the palette under the function group.
