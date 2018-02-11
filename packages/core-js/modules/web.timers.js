// ie9- setTimeout & setInterval additional parameters fix
var global = require('../internals/global');
var userAgent = require('../internals/user-agent');
var slice = [].slice;
var MSIE = /MSIE .\./.test(userAgent); // <- dirty ie9- check
var wrap = function (set) {
  return function (fn, time /* , ...args */) {
    var boundArgs = arguments.length > 2;
    var args = boundArgs ? slice.call(arguments, 2) : false;
    return set(boundArgs ? function () {
      // eslint-disable-next-line no-new-func
      (typeof fn == 'function' ? fn : Function(fn)).apply(this, args);
    } : fn, time);
  };
};

require('../internals/export')({ global: true, bind: true, forced: MSIE }, {
  setTimeout: wrap(global.setTimeout),
  setInterval: wrap(global.setInterval)
});
