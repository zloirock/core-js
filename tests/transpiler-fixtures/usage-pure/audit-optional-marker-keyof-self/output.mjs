import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// a keyof-self value union is the member values of the type: an optional member contributes
// its undefined to that union, on the annotation side (`I[keyof I]`) and on the runtime side
// (a `keyof T`-typed key over a type-parameter receiver) alike
interface I {
  items?: number[];
}
declare const viaAnnotation: I[keyof I];
_at(_ref = viaAnnotation ?? 'fallback').call(_ref, 0);
export function read<T extends I>(source: T, key: keyof T) {
  var _ref2;
  return _includes(_ref2 = source[key] ?? 'fallback').call(_ref2, 'a');
}