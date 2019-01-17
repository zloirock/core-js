// `Map.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
require('../internals/export')({ target: 'Map', stat: true }, {
  from: require('../internals/collection-from')
});
