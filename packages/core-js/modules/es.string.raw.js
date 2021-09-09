var $ = require('../internals/export');
var toIndexedObject = require('../internals/to-indexed-object');
var toObject = require('../internals/to-object');
var toLength = require('../internals/to-length');
var toString = require('../internals/to-string');

var ArrayPrototype = Array.prototype;
var push = ArrayPrototype.push;
var join = ArrayPrototype.join;

// `String.raw` method
// https://tc39.es/ecma262/#sec-string.raw
$({ target: 'String', stat: true }, {
  raw: function raw(template) {
    var rawTemplate = toIndexedObject(toObject(template).raw);
    var literalSegments = toLength(rawTemplate.length);
    var argumentsLength = arguments.length;
    var elements = [];
    var i = 0;
    while (literalSegments > i) {
      push.call(elements, toString(rawTemplate[i++]));
      if (i < argumentsLength) push.call(elements, toString(arguments[i]));
    } return join.call(elements, '');
  }
});
