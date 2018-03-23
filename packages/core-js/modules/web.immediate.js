var global = require('../internals/global');
var task = require('../internals/task');

require('../internals/export')({ global: true, bind: true, forced: !global.setImmediate || !global.clearImmediate }, {
  setImmediate: task.set,
  clearImmediate: task.clear
});
