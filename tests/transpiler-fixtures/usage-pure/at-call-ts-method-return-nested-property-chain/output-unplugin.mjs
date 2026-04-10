var _ref, _ref2;
import _at from "@core-js/pure/actual/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type DB = { query(): { rows: { name: string }[] } };
declare const db: DB;
_at(_ref = _nameMaybeFunction(_atMaybeArray(_ref2 = db.query().rows).call(_ref2, 0))).call(_ref, -1);