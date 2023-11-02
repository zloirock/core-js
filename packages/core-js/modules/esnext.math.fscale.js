'use strict';
var $ = require('../internals/export');
var getBuiltInStaticMethod = require('../internals/get-built-in-static-method');
var scale = require('../internals/math-scale');

// dependency: es.math.fround
var fround = getBuiltInStaticMethod('Math', 'fround');

// `Math.fscale` method
// https://rwaldron.github.io/proposal-math-extensions/
$({ target: 'Math', stat: true, forced: true }, {
  fscale: function fscale(x, inLow, inHigh, outLow, outHigh) {
    return fround(scale(x, inLow, inHigh, outLow, outHigh));
  },
});
