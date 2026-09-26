import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.values";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.entries";
import "core-js/modules/web.dom-collections.values";
// a DECLARATOR pairing the alias past a spread is the same open set: the lone static candidate
// resolves the primary as a maybe, and the instance dispatch stays beside it in both spellings,
// positional and keyed. `Object` reads the same name on both arms: a static off the constructor,
// an instance method off a collection (one method per row, so every row is observable by its own
// module)
const [, viaDeclarator] = [...xs, Object];
export const d = viaDeclarator.values(src);
const {
  1: viaKeyedDeclarator
} = [...xs, Object];
export const e = viaKeyedDeclarator.entries(src);