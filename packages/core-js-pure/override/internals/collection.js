'use strict';
var global = require('../internals/global');
var $export = require('./export');
var InternalMetadataModule = require('../internals/internal-metadata');
var fails = require('../internals/fails');
var hide = require('../internals/hide');
var iterate = require('../internals/iterate');
var anInstance = require('../internals/an-instance');
var isObject = require('../internals/is-object');
var setToStringTag = require('../internals/set-to-string-tag');
var defineProperty = require('../internals/object-define-property').f;
var each = require('../internals/array-methods')(0);
var DESCRIPTORS = require('../internals/descriptors');

module.exports = function (NAME, wrapper, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var exported = {};
  if (!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    InternalMetadataModule.REQUIRED = true;
  } else {
    C = wrapper(function (target, iterable) {
      anInstance(target, C, NAME, '_c');
      target._c = new Base();
      if (iterable != undefined) iterate(iterable, IS_MAP, target[ADDER], target);
    });
    each(['add', 'clear', 'delete', 'forEach', 'get', 'has', 'set', 'keys', 'values', 'entries'], function (KEY) {
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if (KEY in proto && !(IS_WEAK && KEY == 'clear')) hide(C.prototype, KEY, function (a, b) {
        anInstance(this, C, KEY);
        if (!IS_ADDER && IS_WEAK && !isObject(a)) return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    IS_WEAK || defineProperty(C.prototype, 'size', {
      get: function () {
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME, false, true);

  exported[NAME] = C;
  $export({ global: true, wrap: true, forced: true }, exported);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};
