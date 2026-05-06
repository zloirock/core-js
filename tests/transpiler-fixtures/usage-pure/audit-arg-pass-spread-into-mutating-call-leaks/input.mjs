// spread `o` into a CallExpression whose callee has `mutatesArgument` annotated:
// `Object.assign(...o)`. spread arity is unknown at static time - o's spread elements
// could land at any position, including the mutating slot (target at index 0). helper
// returns false from the SpreadElement branch when ANY mutating slot exists; classifier
// falls through to 'leak'. negative-by-design lock: ensures sound over-bail when spread
// ambiguity intersects with a per-slot mutation profile
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
