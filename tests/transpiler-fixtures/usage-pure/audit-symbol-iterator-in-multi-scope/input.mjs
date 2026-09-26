// `Symbol.iterator in X` appears at module scope, inside an arrow body, and inside
// a class method. Each occurrence rewrites independently while a single deduplicated
// `_isIterable` import covers all of them.
const top = Symbol.iterator in src1;
const arrow = () => Symbol.iterator in src2;
class Box {
  has() { return Symbol.iterator in this.data; }
  load() { return Array.from(this.data); }
}
export { top, arrow, Box };
