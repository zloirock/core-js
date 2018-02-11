var global = require('core-js-internals/global');
var hide = require('../internals/hide');
var has = require('core-js-internals/has');
var sharedKey = require('core-js-internals/shared-key');
var hiddenKeys = require('../internals/hidden-keys');
var WeakMap = global.WeakMap;
var exports;

if (typeof WeakMap == 'function' && /native code/.test(WeakMap)) {
  var store = new WeakMap();
  var wmget = store.get;
  var wmhas = store.has;
  var wmset = store.set;
  exports = module.exports = function (object, forced) {
    if (!forced || wmhas.call(store, object)) return wmget.call(store, object) || {};
    var metadata = typeof forced == 'object' ? forced : {};
    wmset.call(store, object, metadata);
    return metadata;
  };
  exports.has = function (object) {
    return wmhas.call(store, object);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  exports = module.exports = function (object, forced) {
    if (!forced || has(object, STATE)) return object[STATE] || {};
    var metadata = typeof forced == 'object' ? forced : {};
    hide(object, STATE, metadata);
    return metadata;
  };
  exports.has = function (object) {
    return has(object, STATE);
  };
}
