'use strict';
var $ = require('../internals/export');

var f32array = new Float32Array(1);

// `Math.fround` method
// https://tc39.es/ecma262/#sec-math.fround
$({ target: 'Math', stat: true }, {
  fround: function fround(x) {
    // call `ToNumber` directly since old FF typed arrays do not convert objects to numbers
    f32array[0] = +x;
    return f32array[0];
  },
});
