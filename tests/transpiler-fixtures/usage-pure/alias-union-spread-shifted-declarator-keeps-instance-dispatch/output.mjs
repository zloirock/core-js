import _entries from "@core-js/pure/actual/instance/entries";
import _values from "@core-js/pure/actual/instance/values";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
// a DECLARATOR pairing the alias past a spread is the same open set: the lone static candidate
// resolves the primary as a maybe, and the instance dispatch stays beside it in both spellings,
// positional and keyed. `Object` reads the same name on both arms: a static off the constructor,
// an instance method off a collection (one method per row, so every row is observable by its own
// module)
const [, viaDeclarator] = [...xs, Object];
export const d = _Object$values.call.call(viaDeclarator === Object ? _Object$values : _values(viaDeclarator), viaDeclarator, src);
const {
  1: viaKeyedDeclarator
} = [...xs, Object];
export const e = _Object$entries.call.call(viaKeyedDeclarator === Object ? _Object$entries : _entries(viaKeyedDeclarator), viaKeyedDeclarator, src);