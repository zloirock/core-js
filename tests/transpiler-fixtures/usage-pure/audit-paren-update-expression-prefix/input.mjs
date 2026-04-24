// prefix `--(X)` / nested `((X))++` must not rewrite to `_X` forms (update needs writable
// target, imports are frozen). `let x = Map` proves the post-sweep still polyfills read
// contexts. the gated update expressions are runtime-invalid in IE 11 (Promise / Set missing),
// so they live behind `if (false)` - only compile-time output is under test here
let x = Map;
x++;
if (false) {
  --(Promise);
  ((Set))++;
}
