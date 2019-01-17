// `WeakMap.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.from
require('../internals/export')({ target: 'WeakMap', stat: true }, {
  from: require('../internals/collection-from')
});
