- [About](#about)
- [Installation](#installation)
- [Examples](#examples)
  - [Usage](#examples)
  - [Mocking](#mocking-for-test-purposes)
- [Documentation](#documentation)

# About
- Node.js object wrapper for unref'ed setInterval.
- **weak** means it will **not** prevent Node.js process to exit if event loop is empty.
- It will help you remember about routine context.
- No external dependencies.

# Installation
Requires [Node.js](https://nodejs.org/) v4.8.7
```sh
$ npm install weak-daemon
```

# Examples

- Ordinary function:
```js
const WeakDaemon = require('weak-daemon').WeakDaemon
                                         
var daemon = new WeakDaemon(             
  102,                                   
  null,                                  
  () => { console.log('tick', 'tock') }  
);                                       
                                         
daemon.start(); // Will print 'tick' 'tock' every ~102 ms

..

/* (!) Note that multiple 'start' call without previous 'stop' will throw error */
daemon.start();     // First call made after ~102ms
daemon.start(false);// First call made after ~102ms
daemon.start(true); // First call made immediately;

..

daemon.start();
daemon.isRunning(); // true
daemon.stop();
daemon.isRunning(); // false
daemon.start();
```

- Equivalent of above example
```js
var daemon = new WeakDaemon(
  102,
  null,
  console.log,
  ['tick', 'tock']
);
```


- Function that requires a caller context, because of `this` usage:
```js
const worker = {
  data: {},
  updateData(source) {
    this.data = source.data;
  } 
}

var daemon = new WeakDaemon(
  102,
  worker,             /* So `this` will be handled properly on `updateData` call */
  worker.updateData,
  [data_source]
);

daemon.start();
```

- Example error scenario:
```js
const worker = {
  data: {},
  source: {...},
  
  updateData() {
    this.data = this.source.data()
  }
}

var daemon = new WeakDaemon(
  101,
  null,               /* `this.source` will be undefined while daemon will call `updateData` */
  worker.updateData
);

/* Error - `this.source` is undefined */
daemon.start();
```

## Mocking for test purposes:
```js
/* your-lib.js */
const {getInstance} = require('weak-daemon');

// :(
const non_mockable_daemon = new WeakDaemon(...args);

// :)
const mockable_daemon = getInstance(...args);
```
```js
/* test-your-lib.js */
const WD = require('weak-daemon');

WD.getInstance = () => { return your_mock; }
```
Alternative way:
```js
/* your-lib.js */
const {WeakDaemon, getClass} = require('weak-daemon');

const non_mockable_daemon = new WeakDaemon(...args)

const MockableWeakDaemon = getClass();
const mockable_daemon = new MockableWeakDaemon(...args);
```
```js
/* test-your-lib.js */
const WD = require('weak-daemon');

WD.getClass = () => { return YourMock; }
```

# Documentation

### class `WeakDaemon`

- ##### `constructor( interval_time, caller, task, task_args=[] )`
  ###### Arguments:
  - `interval` integer number - interval time of task call in milliseconds. Note this is not guarntee to call task every interval, it works exactly the same as `setInterval(..).unref()`
  - `caller` object | null - `task's` caller context (in case if task will use 'this' keyword)
  - `task` function - task that will be called every `interval`
  - `[task_args]` Array<any> - list of arguments task will be called with.

- ##### `start( immediate_call )`
  Start daemon.
  ###### Arguments:
  - `immediate_call` - boolean, is task should be called immediately after start call. Default false.

- ##### `stop()`
  Stop daemon (can be resterted by calling `start`).

- ##### `isRunning()`
  ###### Returns:
  - boolean, is daemon running

- ##### `interval` getter for provided `interval_time`
- ##### `caller` getter for provided `caller`
- ##### `task` getter for provided `task`
- ##### `args` getter for provided `args` ([] returned if not provided])

### function `getInstance`
Provided for mocking purposes.
- ###### Arguments: @see class `WeakDaemon` constructor
- ###### Returns: instance of WeakDaemon.

### function `getClass`
Provided for mocking purposes.
- ###### Arguments: no
- ###### Returns: WeakDaemon class.
