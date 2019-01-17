// `Map.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
require('../internals/export')({ target: 'Map', stat: true }, {
  of: require('../internals/collection-of')
});
