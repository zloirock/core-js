// @types: web/set-immediate
'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var task = require('../internals/task');

var setTask = task.set;
var clearTask = task.clear;

// `setImmediate` and `clearImmediate` methods
// http://w3c.github.io/setImmediate/#si-setImmediate
// http://w3c.github.io/setImmediate/#si-clearImmediate
$({ global: true, bind: true, enumerable: true, forced: globalThis.setImmediate !== setTask || globalThis.clearImmediate !== clearTask }, {
  setImmediate: setTask,
  clearImmediate: clearTask,
});
