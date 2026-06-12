import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
// discriminant literal VALUES go beyond string keys: boolean, bigint and negative
// numeric literal types each select their union branch
type UB = { ok: true, xs: number[] } | { ok: false, xs: string };
function gb(u: UB) { if (u.ok === true) { var _ref; _flatMapMaybeArray(_ref = u.xs).call(_ref, x => [x]); } }
type UG = { v: 10n, xs: number[] } | { v: 2n, xs: string };
function gg(u: UG) { if (u.v === 10n) { var _ref2; _findIndexMaybeArray(_ref2 = u.xs).call(_ref2, x => !!x); } }
type UN = { v: -1, xs: number[] } | { v: 2, xs: string };
function gm(u: UN) { if (u.v === -1) { var _ref3; _findLastMaybeArray(_ref3 = u.xs).call(_ref3, x => !!x); } }