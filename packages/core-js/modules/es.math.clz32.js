// 20.2.2.11 Math.clz32(x)
require('./_export')({ target: 'Math', stat: true }, {
  clz32: function clz32(x) {
    return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
  }
});
