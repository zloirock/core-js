// `WeakSet.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.of
require('../internals/export')({ target: 'WeakSet', stat: true }, {
  of: require('../internals/collection-of')
});
