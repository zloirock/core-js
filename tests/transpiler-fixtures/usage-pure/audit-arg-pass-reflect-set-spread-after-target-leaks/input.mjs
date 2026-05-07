// `Reflect.set(target, key, ...o)` - SpreadElement at AST index 2; mutatesArgument [0, 3]
// includes the receiver slot (index 3). naive `includes(2)` check would miss this since
// the spread itself sits at index 2, but at runtime spread expands to positions 2, 3, 4...
// and index 3 is the mutating receiver slot. SpreadElement branch widens to "any annotated
// index >= AST position", correctly classifying as 'leak'. negative-by-design lock for the
// PROV-CLF-1 spread-expansion soundness fix
const target = {};
const o = {
  arr: [1, 2, 3],
  test() {
    Reflect.set(target, "x", ...o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
