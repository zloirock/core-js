// `{...o}` puts `o` inside a SpreadElement that the ObjectExpression consumes by
// enumerating own enumerable properties of `o`. `o` is read, not passed as a target slot;
// the resulting object is a SHALLOW COPY of o's own props, never an alias. classifier sees
// SpreadElement parent and returns 'trivial' directly - same applies to `[...o]` / `f(...o)`
// / `new C(...o)` (iteration sites). without this rule, every spread site would leak the
// closure even though the spread is purely a read
const o = {
  arr: [1, 2, 3],
  test() {
    const copy = { ...o };
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b, copy];
  }
};
o.test();
