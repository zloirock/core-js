// spread `o` into a CallExpression whose callee carries no `mutatesArgument` annotation:
// `Math.max(...o)` (Math.max with no annotation). helper unwraps the SpreadElement parent
// through grandparent to Math.max, sees no mutating slot, returns 'trivial' regardless of
// where o's spread elements would land at runtime. complement to the ObjectExpression
// spread fixture (audit-arg-pass-spread-as-arg-narrows) which exercises the value-source
// container path; this one exercises the call-with-non-mutating-callee path
const o = {
  arr: [1, 2, 3],
  test() {
    Math.max(...o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
