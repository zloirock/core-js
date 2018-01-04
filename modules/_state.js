var global = require('./_global');
var hide = require('./_hide');
var has = require('./_has');
var sharedKey = require('./_shared-key');
var hiddenKeys = require('./_hidden-keys');
var WeakMap = global.WeakMap;
var exports;

if (typeof WeakMap == 'function' && /native code/.test(WeakMap)) {
  var store = new WeakMap();
  exports = module.exports = function (object, forced) {
    if (!forced || store.has(object)) return store.get(object) || {};
    var metadata = typeof forced == 'object' ? forced : {};
    store.set(object, metadata);
    return metadata;
  };
  exports.has = function (object) {
    return store.has(object);
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
