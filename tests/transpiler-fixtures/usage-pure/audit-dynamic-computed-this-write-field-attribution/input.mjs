// a computed `this`-write names a field only by its STATIC key. a DYNAMIC key (`this[a]`, an
// identifier) resolves to whatever the variable holds at runtime - including the name of any
// field on this class - so it poisons the whole surface: no per-field initializer narrow can
// survive it, and every read falls back to the generic helper. a string-literal key
// (`this['b']`) and a single-quasi template key (`this[`c`]`) name ONE field each and widen
// only that one. separate fields keep the flows independent; distinct methods / imports trace
// each line.
class Dynamic {
  a = [1, 2, 3];
  b = [4, 5, 6];
  c = [7, 8, 9];
  dyn(a) { this[a] = "x"; return this.a.at(0); }
  lit() { this["b"] = "x"; return this.b.includes(0); }
  tpl() { this[`c`] = "x"; return this.c.at(0); }
}

const d = new Dynamic();
export const x = d.dyn(0);
export const y = d.lit();
export const z = d.tpl();
// a class WITHOUT any dynamic write keeps its per-field narrow - the poison is per-surface,
// not global
class Static {
  items = [1, 2, 3];
  read() { return this.items.at(0); }
}
export const kept = new Static().read();
