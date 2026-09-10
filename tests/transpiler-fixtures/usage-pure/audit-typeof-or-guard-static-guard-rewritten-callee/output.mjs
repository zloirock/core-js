import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// the babel leg rewrites `Number.isFinite` to its pure-import binding before the receiver behind
// the guard is resolved; the guard parser reads the built-in back through the injector's entry
// path, so the OR group narrows to string on both legs alike - one decision, no sidecar
export function f(x: string | number[]) {
  if (typeof x === 'string' || _Number$isFinite(x as any)) return _atMaybeString(x).call(x, 0);
  return null;
}