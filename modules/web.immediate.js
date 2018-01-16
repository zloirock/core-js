var $task = require('./_task');

require('./_export')({ global: true, bind: true }, {
  setImmediate: $task.set,
  clearImmediate: $task.clear
});
