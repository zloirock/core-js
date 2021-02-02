'use strict';
var $ = require('../internals/export');
var RangeIterator = require('../internals/range-iterator');

// `BigInt.range` method
// https://github.com/tc39/proposal-Number.range
if (typeof BigInt == 'function') {
  $({ target: 'BigInt', stat: true }, {
    range: function range(start, end, option) {
      /* global BigInt -- safe */
      return new RangeIterator(start, end, option, 'bigint', BigInt(0), BigInt(1));
    }
  });
}
