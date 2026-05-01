import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Self-referential generic alias: `type R<T = R<string[]>>`.
// resolveUserDefinedType uses `seen.has(declaration)` to detect cycle (line 886).
// The default value R<string[]> references R itself — cycle through default. Once cycle detected,
// returns null which keeps generic polyfill emitted.
type R<T = R<string[]>> = {
  val: T;
};
declare const x: R;
_at(_ref = x.val).call(_ref, 0);