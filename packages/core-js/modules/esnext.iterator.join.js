'use strict';
var $ = require('../internals/export');
var $toString = require('../internals/to-string');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var isNullOrUndefined = require('../internals/is-null-or-undefined');
var iterate = require('../internals/iterate');
var iteratorClose = require('../internals/iterator-close');
var uncurryThis = require('../internals/function-uncurry-this');

var $join = uncurryThis([].join);
var push = uncurryThis([].push);

// `Iterator.prototype.join` method
// https://bakkot.github.io/proposal-iterator-join/
// dependency: es.iterator.constructor
$({ target: 'Iterator', proto: true, real: true, forced: true }, {
  join: function join(separator) {
    var O = anObject(this);
    var sep;
    try {
      sep = separator === undefined ? ',' : $toString(separator);
    } catch (error) {
      iteratorClose(O, 'throw', error);
    }
    var result = [];
    var iterated = getIteratorDirect(O);
    iterate(iterated, function (value) {
      push(result, isNullOrUndefined(value) ? '' : $toString(value));
    }, { IS_RECORD: true });
    return $join(result, sep);
  },
});
