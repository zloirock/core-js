// `WeakMap.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.of
require('../internals/export')({ target: 'WeakMap', stat: true }, {
  of: require('../internals/collection-of')
});
