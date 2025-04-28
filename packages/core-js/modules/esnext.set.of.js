// type: proposals/collection-of-from.d.ts
'use strict';
var $ = require('../internals/export');
var SetHelpers = require('../internals/set-helpers');
var createCollectionOf = require('../internals/collection-of');

// `Set.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
// @dependency: es.set.constructor
$({ target: 'Set', stat: true, forced: true }, {
  of: createCollectionOf(SetHelpers.Set, SetHelpers.add, false),
});
