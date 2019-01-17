// `Set.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
require('../internals/export')({ target: 'Set', stat: true }, {
  from: require('../internals/collection-from')
});
