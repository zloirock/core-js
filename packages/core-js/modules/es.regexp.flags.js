// 21.2.5.3 get RegExp.prototype.flags()
if (require('core-js-internals/descriptors') && /./g.flags != 'g') {
  require('./_object-dp').f(RegExp.prototype, 'flags', {
    configurable: true,
    get: require('core-js-internals/regexp-flags')
  });
}
