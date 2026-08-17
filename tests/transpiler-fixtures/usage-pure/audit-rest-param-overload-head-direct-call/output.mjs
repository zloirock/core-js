import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// a direct call resolves against the FIRST head whose parameters match, exactly as TypeScript does -
// the implementation signature is not callable. The heads answer `string` while the implementation is
// declared `any`, so the two answers stay distinguishable: taking the implementation would degrade to
// the generic helper. The body returns a string on purpose - the emitted helper must match the RUNTIME
// value or it throws on an engine lacking the method, and TS itself rejects a set whose implementation
// contradicts its heads. The rest params keep the heads in the scope-less position that used to be
// rewritten into a body-bearing declaration, which is how the widened answer used to happen.
function f(...a: number[]): string;
function f(...a: string[]): string;
function f(...a: any[]): any {
  return "ab";
}
_atMaybeString(_ref = f()).call(_ref, 0);