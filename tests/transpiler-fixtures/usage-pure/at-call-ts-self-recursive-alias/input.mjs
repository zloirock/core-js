// self-recursive type alias `type Rec<T> = Rec<T[]>` must not blow the stack
// or spin to the depth limit; element-type resolution bails on the cycle and
// `.at` falls back to the generic instance polyfill
type Rec<T> = Rec<T[]>;
declare const r: Rec<number>;
r.at(-1);
