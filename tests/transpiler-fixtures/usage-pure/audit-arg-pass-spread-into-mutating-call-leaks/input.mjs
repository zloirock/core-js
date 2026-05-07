// spread `o` into a CallExpression whose callee has `mutatesArgument` annotated:
// `Object.assign(...o)`. spread sits at AST index 0; mutating slot is also 0; the
// SpreadElement branch widens the check to "any annotated index >= spread position",
// so target slot 0 is reachable -> classifier falls through to 'leak'. negative-by-design
// lock: ensures sound over-bail when spread expansion intersects a per-slot mutation profile
const o = {
  arr: [1, 2, 3],
  test() {
    Object.assign(...o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
