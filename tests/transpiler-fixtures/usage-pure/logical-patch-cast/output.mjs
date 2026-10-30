import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
var _ref;
// A type assertion wraps the write target, not its receiver.
// The served read prefers the polyfill; only the source fallback writes the slot.
_flatMapMaybeArray(_ref = Array.prototype) ?? ((_ref.flatMap as any) = () => ['fallback']);
export {};