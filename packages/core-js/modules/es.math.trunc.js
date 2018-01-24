// 20.2.2.34 Math.trunc(x)
require('./_export')({ target: 'Math', stat: true }, {
  trunc: function trunc(it) {
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }
});
