import _entries from "@core-js/pure/actual/instance/entries";
import _keys from "@core-js/pure/actual/instance/keys";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
// a pattern write pairing the alias PAST a spread reads only the statics after it, so the alias's
// value set is OPEN - the spread's own items are unenumerable - and the instance dispatch stays
// beside the static candidate in both spellings of the write, positional and keyed. `Object` reads
// the same name on both arms: a static off the constructor, an instance method off a collection
// (one method per row, so every row is observable by its own module)
let viaReassign = Object;
if (c) [, viaReassign] = [...xs, Object];
export const a = (viaReassign === Object ? _Object$entries : _entries(viaReassign).bind(viaReassign))(src);
let viaKeyedReassign = Object;
if (c) ({
  1: viaKeyedReassign
} = [...xs, Object]);
export const b = (viaKeyedReassign === Object ? _Object$keys : _keys(viaKeyedReassign).bind(viaKeyedReassign))(src);