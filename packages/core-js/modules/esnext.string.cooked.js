var $ = require('../internals/export');
var toIndexedObject = require('../internals/to-indexed-object');
var toString = require('../internals/to-string');
var lengthOfArrayLike = require('../internals/length-of-array-like');

var ArrayPrototype = Array.prototype;
var push = ArrayPrototype.push;
var join = ArrayPrototype.join;

// `String.cooked` method
// https://github.com/bathos/proposal-string-cooked
$({ target: 'String', stat: true }, {
  cooked: function cooked(template /* , ...substitutions */) {
    var cookedTemplate = toIndexedObject(template);
    var literalSegments = lengthOfArrayLike(cookedTemplate);
    var argumentsLength = arguments.length;
    var elements = [];
    var i = 0;
    while (literalSegments > i) {
      var nextVal = cookedTemplate[i++];
      if (nextVal === undefined) throw TypeError('Incorrect template');
      push.call(elements, toString(nextVal));
      if (i === literalSegments) return join.call(elements, '');
      if (i < argumentsLength) push.call(elements, toString(arguments[i]));
    }
  }
});
