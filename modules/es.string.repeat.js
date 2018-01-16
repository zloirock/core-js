require('./_export')({ target: 'String', proto: true }, {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: require('./_string-repeat')
});
