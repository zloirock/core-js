import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `ReturnType<Fn>.x` where `Fn` is a direct function-type alias (no `typeof`). the
// `ReturnType<typeof fn>` (TSTypeQuery) form was handled but the alias form bailed.
// resolution must follow the alias chain, extract the return annotation, then resolve
// members; without it the `.at(0)` dispatch falls through to generic `_at`.
type Fn = () => string[];
declare const xs: ReturnType<Fn>;
_atMaybeArray(xs).call(xs, 0);