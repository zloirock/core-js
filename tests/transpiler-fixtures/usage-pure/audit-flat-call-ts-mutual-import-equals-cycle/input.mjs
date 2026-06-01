// a MUTUAL `import A=B.X; import B=A.Y` cycle (two decls, not a single self-ref) must bail on
// re-entry while resolving the annotation namespace, so `.flat` degrades to the generic instance
// polyfill instead of recursing the two aliases unbounded
import A = B.X;
import B = A.Y;
declare const r: A.Items;
r.flat();
