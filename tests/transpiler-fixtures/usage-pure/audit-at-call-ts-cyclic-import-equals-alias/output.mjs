import _at from "@core-js/pure/actual/instance/at";
// a self-referential `import X = X.Y` alias must not recurse unbounded while resolving the
// annotation namespace; the alias walk bails on re-entry, so `.at` degrades to the generic
// instance polyfill instead of overflowing the stack and aborting the whole file transform
import A = A.B;
declare const r: A.Items;
_at(r).call(r, 0);