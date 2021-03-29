var $ = require('../internals/export');
var task = require('../internals/task');

// `setImmediate` method
// http://w3c.github.io/setImmediate/#si-setImmediate
$({ global: true, bind: true, enumerable: true, forced: task.FORCED }, {
  setImmediate: task.set,
});
