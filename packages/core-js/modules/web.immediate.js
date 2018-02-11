var task = require('core-js-internals/task');

require('../internals/export')({ global: true, bind: true }, {
  setImmediate: task.set,
  clearImmediate: task.clear
});
