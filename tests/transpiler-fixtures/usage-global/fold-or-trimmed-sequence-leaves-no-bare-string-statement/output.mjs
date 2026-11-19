require("core-js/modules/es.symbol.constructor");
require("core-js/modules/es.symbol.description");
require("core-js/modules/es.object.to-string");
require("core-js/modules/es.array.iterator");
require("core-js/modules/es.global-this");
require("core-js/modules/es.map.constructor");
require("core-js/modules/es.map.species");
require("core-js/modules/es.map.get-or-insert");
require("core-js/modules/es.map.get-or-insert-computed");
require("core-js/modules/es.set.constructor");
require("core-js/modules/es.set.species");
require("core-js/modules/es.set.difference");
require("core-js/modules/es.set.intersection");
require("core-js/modules/es.set.is-disjoint-from");
require("core-js/modules/es.set.is-subset-of");
require("core-js/modules/es.set.is-superset-of");
require("core-js/modules/es.set.symmetric-difference");
require("core-js/modules/es.set.union");
require("core-js/modules/es.string.iterator");
require("core-js/modules/web.dom-collections.iterator");
// usage-global rewrites none of these statements, so no string is left alone where it would read as a
// directive: each loads the modules of the global its test or its sequence's prefix reads
typeof Symbol == 'undefined' ? installSymbol() : 'ready';
'use strict';
module.exports = [function () {
  globalThis.Set, 'use strict';
  return this;
}, function () {
  typeof Map == 'undefined' && installMap(), 'use strict';
  return this;
}];