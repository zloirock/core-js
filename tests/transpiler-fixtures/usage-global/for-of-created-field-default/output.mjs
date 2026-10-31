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
// A write can create a field absent from the named holder's initializer.
// The nested default remains guarded; its array type cannot describe the supplied string.
const row = {};
row.w = '02';
for (const {
  w: {
    at,
    includes
  } = [0, 2]
} of [row]) use(at.call('02', -1), includes.call('02', '02'));