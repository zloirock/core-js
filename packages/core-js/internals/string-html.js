var $export = require('../internals/export');
var fails = require('../internals/fails');
var requireObjectCoercible = require('../internals/require-object-coercible');
var quot = /"/g;

// B.2.3.2.1 CreateHTML(string, tag, attribute, value)
var createHTML = function (string, tag, attribute, value) {
  var S = String(requireObjectCoercible(string));
  var p1 = '<' + tag;
  if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
  return p1 + '>' + S + '</' + tag + '>';
};

module.exports = function (NAME, exec) {
  var exported = {};
  exported[NAME] = exec(createHTML);
  $export({ target: 'String', proto: true, forced: fails(function () {
    var test = ''[NAME]('"');
    return test !== test.toLowerCase() || test.split('"').length > 3;
  }) }, exported);
};
