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
var InternalStateModule = require('../internals/internal-state');
var setInternalState = InternalStateModule.set;
var internalStateGetterFor = InternalStateModule.getterFor;

module.exports = function (NAME, wrapper, common, IS_MAP, IS_WEAK) {
  var NativeConstructor = global[NAME];
  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
  var ADDER = IS_MAP ? 'set' : 'add';
  var exported = {};
  var Constructor;

  if (!DESCRIPTORS || typeof NativeConstructor != 'function'
    || !(IS_WEAK || NativePrototype.forEach && !fails(function () { new NativeConstructor().entries().next(); }))
  ) {
    // create collection constructor
    Constructor = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    InternalMetadataModule.REQUIRED = true;
  } else {
    Constructor = wrapper(function (target, iterable) {
      setInternalState(anInstance(target, Constructor, NAME), {
        type: NAME,
        collection: new NativeConstructor()
      });
      if (iterable != undefined) iterate(iterable, target[ADDER], target, IS_MAP);
    });

    var getInternalState = internalStateGetterFor(NAME);

    each(['add', 'clear', 'delete', 'forEach', 'get', 'has', 'set', 'keys', 'values', 'entries'], function (KEY) {
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if (KEY in NativePrototype && !(IS_WEAK && KEY == 'clear')) hide(Constructor.prototype, KEY, function (a, b) {
        var collection = getInternalState(this).collection;
        if (!IS_ADDER && IS_WEAK && !isObject(a)) return KEY == 'get' ? undefined : false;
        var result = collection[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });

    IS_WEAK || defineProperty(Constructor.prototype, 'size', {
      get: function () {
        return getInternalState(this).collection.size;
      }
    });
  }

  setToStringTag(Constructor, NAME, false, true);

  exported[NAME] = Constructor;
  $export({ global: true, forced: true }, exported);

  if (!IS_WEAK) common.setStrong(Constructor, NAME, IS_MAP);

  return Constructor;
};
