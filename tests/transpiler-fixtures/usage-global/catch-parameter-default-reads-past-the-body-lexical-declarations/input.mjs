// a catch parameter is evaluated outside the clause's body block, so its default reads past what that
// block binds in itself - `let` / `const` / `class` / a strict function - to a global or the outer
// binding, while a `var` of the body hoists past the block to the function, so the default reads that
// one, its initializer not run yet. the `Promise` and `Iterator` reads load their families; distinct
// member per line
try { f(); } catch ({ p = Promise.resolve(1) }) {
  let Promise = 1;
  use(p, Promise);
}
const s = 'abc';
try { f(); } catch ({ q = s.at(-1) }) {
  class s {}
  use(q, s);
}
try { f(); } catch ({ r = Iterator.from(x) }) {
  function Iterator() {}
  use(r, Iterator);
}
const list = [1, 2];
function g() {
  try { f(); } catch ({ t = list.includes(2) }) {
    var list = 'abc';
    use(t, list);
  }
}
