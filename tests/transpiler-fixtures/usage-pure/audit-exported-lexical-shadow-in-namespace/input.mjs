// `export let X` inside a namespace binds X like the bare `let` does: a write to it inside the
// namespace targets that inner binding, so the outer alias of the same name stays constant and its
// static folds - the export wrapper is transparent to the shadow census
export function f() {
  var X = Array;
  namespace N {
    export let X;
    X = 1;
  }
  return X.from([]);
}
