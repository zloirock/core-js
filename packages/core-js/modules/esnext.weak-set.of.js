var $ = require('../internals/export');
var of = require('../internals/collection-of');

// `WeakSet.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.of
$({ target: 'WeakSet', stat: true }, {
  of: of,
});
