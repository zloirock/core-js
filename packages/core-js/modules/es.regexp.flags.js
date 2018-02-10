// `RegExp.prototype.flags` getter
// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
if (require('core-js-internals/descriptors') && /./g.flags != 'g') {
  require('./_object-define-property').f(RegExp.prototype, 'flags', {
    configurable: true,
    get: require('core-js-internals/regexp-flags')
  });
}
