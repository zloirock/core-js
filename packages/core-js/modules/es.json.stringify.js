var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var fails = require('../internals/fails');
var IndexedObject = require('../internals/indexed-object');

var $stringify = getBuiltIn('JSON', 'stringify');
var reg = /[\uD800-\uDFFF]/g;
var re = /^[\uD800-\uDFFF]$/;
var low = /^[\uD800-\uDBFF]$/;
var hi = /^[\uDC00-\uDFFF]$/;

var fix = function (string) {
  var indexed = IndexedObject(string);
  var length = indexed.length;
  var result = '';
  var i = 0;
  var point, prev, next;
  for (; i < length; i++) {
    point = indexed[i];
    if (re.test(point)) {
      prev = i === 0 ? '' : indexed[i - 1];
      next = i === length - 1 ? '' : indexed[i + 1];
      if ((low.test(point) && !hi.test(next)) || (hi.test(point) && !low.test(prev))) {
        result += '\\u' + point.charCodeAt(0).toString(16);
        continue;
      }
    } result += point;
  } return result;
};

var FORCED = fails(function () {
  return $stringify('\uDF06\uD834') !== '"\\udf06\\ud834"'
    || $stringify('\uDEAD') !== '"\\udead"';
});

if ($stringify) {
  // https://github.com/tc39/proposal-well-formed-stringify
  $({ target: 'JSON', stat: true, forced: FORCED }, {
    // eslint-disable-next-line no-unused-vars
    stringify: function stringify(it, replacer, space) {
      var result = $stringify.apply(null, arguments);
      return typeof result == 'string' && reg.test(result) ? fix(result) : result;
    }
  });
}
