import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `Array.isArray(x as unknown)` - KNOWN_STATIC_TYPE_GUARDS arg lookup previously peeled
// only ParenthesizedExpression. TSAsExpression / `<T>cast` / `!` survived the peel and
// `arg0.type === 'Identifier'` failed, so the known-static-guard never activated and the
// narrow dropped. switched to the runtime-transparent peel - symmetric with the
// user-predicate arg matcher. `Array.isArray(x as unknown)` now narrows the
// element-access through the array branch
declare const x: string | string[];
if (Array.isArray(x as unknown)) {
  _atMaybeArray(x).call(x, 0);
}