import _at from "@core-js/pure/actual/instance/at";
// nested loops: `x` is declared outside both, but the use and the reassignment both sit in the INNER
// loop body, so the inner loop's back-edge alone makes the narrow stale. the walk must catch the
// nearest enclosing loop, not only the outermost - degrade to the generic instance variant.
declare function cond(): boolean;
declare function readString(): string;
let x = [1, 2, 3];
while (cond()) {
  while (cond()) {
    _at(x).call(x, -1);
    x = readString();
  }
}