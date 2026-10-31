// `const m = o.test` extracts the method as a free function reference; calling `m()` at
// any later point can observe writes that happen between extraction and the deferred call.
// temporal flow detects extraction (member access not in a CallExpression / write context)
// and falls back to fold-all behavior: the write `o.arr = "x"` joins the candidate union
// and narrow collapses to generic `_at`
const o = {
  arr: [1, 2, 3],
  test() {
    return this.arr.at(0);
  }
};
const m = o.test;
o.arr = "x";
m();
