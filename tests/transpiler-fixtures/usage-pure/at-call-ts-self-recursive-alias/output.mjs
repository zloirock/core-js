import _at from "@core-js/pure/actual/instance/at";
// self-recursive type alias `type Rec<T> = Rec<T[]>` - resolveTypeArgs now threads `seen`
// through substituteTypeParams, so type-param resolution hits the decl-seen guard on
// re-entry instead of CPU-burning up to MAX_DEPTH. resolution bails, caller falls back
type Rec<T> = Rec<T[]>;
declare const r: Rec<number>;
_at(r).call(r, -1);