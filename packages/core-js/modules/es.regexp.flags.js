// `RegExp.prototype.flags` getter
// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
if (require('../internals/descriptors') && /./g.flags != 'g') {
  require('../internals/object-define-property').f(RegExp.prototype, 'flags', {
    configurable: true,
    get: require('../internals/regexp-flags')
  });
}
