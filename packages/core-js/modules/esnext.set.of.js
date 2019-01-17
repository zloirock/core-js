// `Set.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
require('../internals/export')({ target: 'Set', stat: true }, {
  of: require('../internals/collection-of')
});
