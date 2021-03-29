var $ = require('../internals/export');
var task = require('../internals/task');

// `clearImmediate` method
// http://w3c.github.io/setImmediate/#si-clearImmediate
$({ global: true, bind: true, enumerable: true, forced: task.FORCED }, {
  clearImmediate: task.clear,
});
