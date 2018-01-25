var task = require('core-js-internals/task');

require('./_export')({ global: true, bind: true }, {
  setImmediate: task.set,
  clearImmediate: task.clear
});
