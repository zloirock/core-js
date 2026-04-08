var _ref;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Wrapper<T> = { kind: 'a'; get(): T } | { kind: 'b'; get(): T };
declare const w: Wrapper<string[]>;
_atMaybeArray(_ref = w.get()).call(_ref, 0);