// A returned local name never proves the same-spelled global in the caller scope.
// Local constructor shadows retain their native prototype reads.
const v = (() => { const Map = WeakMap; return Map; })().prototype.values;
const k = (() => { const Set = WeakSet; return Set; })().prototype.keys;
const e = (() => { const Array = String; return Array; })().prototype.entries;
export { v, k, e };
