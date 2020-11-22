'use strict';
var $ = require('../internals/export');
var RangeIterator = require('../internals/range-iterator');

// `Number.range` method
// https://github.com/tc39/proposal-Number.range
$({ target: 'Number', stat: true }, {
  range: function range(start, end, option) {
    return new RangeIterator(start, end, option, 'number', 0, 1);
  }
});
