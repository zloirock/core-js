var bind = require('../internals/function-bind-context');
var has = require('../internals/has');
var IndexedObject = require('../internals/indexed-object');
var toObject = require('../internals/to-object');
var toLength = require('../internals/to-length');
var toPrimitive = require('../internals/to-primitive');
var objectCreate = require('../internals/object-create');

var push = [].push;

module.exports = function ($this, callbackfn, that, specificCreate) {
  var O = toObject($this);
  var self = IndexedObject(O);
  var boundFunction = bind(callbackfn, that, 3);
  var target = objectCreate(null);
  var length = toLength(self.length);
  var index = 0;
  var value, result, array;
  for (;length > index; index++) {
    value = self[index];
    result = toPrimitive(boundFunction(value, index, O), 'string');
    if (has(target, result)) array = target[result];
    else target[result] = array = specificCreate ? specificCreate($this, 0) : [];
    push.call(array, value);
  } return target;
};
