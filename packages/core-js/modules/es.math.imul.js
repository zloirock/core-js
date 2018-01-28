// 20.2.2.18 Math.imul(x, y)
var $imul = Math.imul;

// some WebKit versions fails with big numbers, some has wrong arity
require('./_export')({ target: 'Math', stat: true, forced: require('core-js-internals/fails')(function () {
  return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
}) }, {
  imul: function imul(x, y) {
    var UINT16 = 0xffff;
    var xn = +x;
    var yn = +y;
    var xl = UINT16 & xn;
    var yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});
