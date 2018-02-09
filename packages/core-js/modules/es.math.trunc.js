// `Math.trunc` method
// https://tc39.github.io/ecma262/#sec-math.trunc
require('./_export')({ target: 'Math', stat: true }, {
  trunc: function trunc(it) {
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }
});
