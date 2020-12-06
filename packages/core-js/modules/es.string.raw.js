var $ = require('../internals/export');
var toObject = require('../internals/to-object');
var toLength = require('../internals/to-length');
var toString = require('../internals/to-string');

// `String.raw` method
// https://tc39.es/ecma262/#sec-string.raw
$({ target: 'String', stat: true }, {
  raw: function raw(template) {
    var rawTemplate = toObject(template.raw);
    var literalSegments = toLength(rawTemplate.length);
    var argumentsLength = arguments.length;
    var elements = [];
    var i = 0;
    while (literalSegments > i) {
      elements.push(toString(rawTemplate[i++]));
      if (i < argumentsLength) elements.push(toString(arguments[i]));
    } return elements.join('');
  },
});
