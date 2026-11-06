import _at from "@core-js/pure/actual/instance/at";
// self-recursive type alias `type Rec<T> = Rec<T[]>` must not blow the stack
// or spin to the depth limit; element-type resolution bails on the cycle and
// `.at` falls back to the generic instance polyfill
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
type Rec<T> = Rec<T[]>;
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
declare const r: Rec<number>;
_at(r).call(r, -1);