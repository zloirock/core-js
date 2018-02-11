require('../internals/export')({ global: true, wrap: true, forced: !require('../internals/typed').ABV }, {
  DataView: require('../internals/typed-buffer').DataView
});
