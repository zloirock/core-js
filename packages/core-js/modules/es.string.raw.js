var toIndexedObject = require('core-js-internals/to-indexed-object');
var toLength = require('core-js-internals/to-length');

// `String.raw` method
// https://tc39.github.io/ecma262/#sec-string.raw
require('./_export')({ target: 'String', stat: true }, {
  raw: function raw(template) {
    var rawTemplate = toIndexedObject(template.raw);
    var literalSegments = toLength(rawTemplate.length);
    var argumentsLength = arguments.length;
    var elements = [];
    var i = 0;
    while (literalSegments > i) {
      elements.push(String(rawTemplate[i++]));
      if (i < argumentsLength) elements.push(String(arguments[i]));
    } return elements.join('');
  }
});
