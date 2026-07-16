import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// A for-of head member write rebinds the slot each iteration - body reads of the SAME
// slot alias that local write, not the prototype method, so they must stay raw. Transparent
// wrappers (parens survive the oxc parse, TS casts survive both parsers) must not break
// the write-target matching in either position.
// wrapped body read - paren around the receiver
const a = [1, 2];
for (a.at of fns) {
  a.at(0);
}
// wrapped body read - TS cast around the receiver
const b: number[] = [3, 4];
for (b.includes of fns) {
  (b as any).includes(1);
}
// wrapped head write target - paren around the object
const c = [[5]];
for (c.flat of fns) {
  c.flat();
}
// wrapped head write target - TS cast around the object
const d: number[] = [6, 7];
for ((d as any).values of fns) {
  d.values();
}
// optional body read - optionality resolves the SAME written slot (parsers spell it
// differently: OptionalMemberExpression vs ChainExpression-wrapped member)
const g = [11, 12];
for (g.filter of fns) {
  g?.filter(Boolean);
}
// pattern-nested write targets: array element with a cast, defaulted element, and a
// paren-wrapped property value each rebind the slot through their own pattern branch
const h: number[] = [13];
for ([(h as any).find] of fns) {
  h.find(Boolean);
}
const i = [14];
for ([i.findLast = dflt] of fns) {
  i.findLast(Boolean);
}
const j = [15];
for ({
  x: j.keys
} of fns) {
  j.keys();
}
// for-await rebinds the slot the same way as the sync loop
const l = [16];
for await ((l as any).entries of fns) {
  l.entries();
}
// control: a DIFFERENT receiver's same-named method is not part of the write set
const e = [8, 9];
const f = [10];
for (e.map of fns) {
  _mapMaybeArray(f).call(f, x => x);
}