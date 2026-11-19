import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A loop element's named holder keeps field writes visible to nested instance reads.
// The current string value must not use its initializer's array dispatch or a dead default.
const row = {
  w: [0, 2]
};
row.w = '02';
for (const {
  w: {
    at,
    includes
  }
} of [row]) use(at.call('02', -1), includes.call('02', '02'));