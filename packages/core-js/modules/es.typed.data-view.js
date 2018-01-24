require('./_export')({ global: true, wrap: true, forced: !require('./_typed').ABV }, {
  DataView: require('./_typed-buffer').DataView
});
