var global = require('../internals/global');
var task = require('../internals/task');
var FORCED = !global.setImmediate || !global.clearImmediate;

require('../internals/export')({ global: true, bind: true, enumerable: true, forced: FORCED }, {
  setImmediate: task.set,
  clearImmediate: task.clear
});
