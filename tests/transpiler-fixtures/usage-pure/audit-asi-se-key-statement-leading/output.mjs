import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// statement-leading SE-wrap: previous statement is `a` (no `;`), next line is
// `Symbol[(fn(), 'iterator')]`. naive emission `(fn(), _Symbol$iterator)` would fuse
// with `a` into `a(fn(), _Symbol$iterator)` — call instead of two separate exprs
let a = () => 0;
let fn = () => 0;
a;
fn(), _Symbol$iterator;