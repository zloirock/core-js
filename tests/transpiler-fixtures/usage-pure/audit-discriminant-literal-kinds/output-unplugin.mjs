import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// discriminant literal VALUES go beyond string keys: boolean, bigint and negative
// numeric literal types each select their union branch. multi-type methods (at/includes) prove the narrow -
// the narrowed `number[]` arm yields the array-specific helper, the un-narrowed `number[] | string` union
// the generic one
type UB = { ok: true, xs: number[] } | { ok: false, xs: string };
function gb(u: UB) { if (u.ok === true) { var _ref; _atMaybeArray(_ref = u.xs).call(_ref, 0); } }
type UG = { v: 10n, xs: number[] } | { v: 2n, xs: string };
function gg(u: UG) { if (u.v === 10n) { var _ref2; _includesMaybeArray(_ref2 = u.xs).call(_ref2, 1); } }
type UN = { v: -1, xs: number[] } | { v: 2, xs: string };
function gm(u: UN) { if (u.v === -1) { var _ref3; _atMaybeArray(_ref3 = u.xs).call(_ref3, -1); } }