// a pattern write pairing the alias PAST a spread reads only the statics after it, so the alias's
// value set is OPEN - the spread's own items are unenumerable - and the instance dispatch stays
// beside the static candidate in both spellings of the write, positional and keyed. `Object` reads
// the same name on both arms: a static off the constructor, an instance method off a collection
// (one method per row, so every row is observable by its own module)
let viaReassign = Object;
if (c) [, viaReassign] = [...xs, Object];
export const a = viaReassign.entries(src);
let viaKeyedReassign = Object;
if (c) ({ 1: viaKeyedReassign } = [...xs, Object]);
export const b = viaKeyedReassign.keys(src);
