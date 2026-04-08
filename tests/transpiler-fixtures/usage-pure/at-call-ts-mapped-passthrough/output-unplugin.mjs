var _ref;
import _at from "@core-js/pure/actual/instance/at";
type Copy<T> = { [K in keyof T]: T[K] };
declare const x: Copy<{ items: number[] }>;
_at(_ref = x.items).call(_ref, 0);