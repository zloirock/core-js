// a computed `this`-write names a field only by its STATIC key. a dynamic key (`this[a]`, an
// identifier) names the field by the variable's runtime VALUE, not its name - so the array field
// keeps its narrow even when the variable matches the field name. a string-literal key (`this['b']`)
// and a single-quasi template key (`this[`c`]`) are STATIC names that really write - and widen -
// those fields, read back as the generic helper. separate fields keep the flows independent;
// distinct methods / imports trace each line.
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
