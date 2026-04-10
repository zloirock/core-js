var _ref, _ref2, _ref3;
import _at from "@core-js/pure/actual/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type DB = {
  query(): {
    rows: {
      name: string;
    }[];
  };
};
declare const db: DB;
_at(_ref = _nameMaybeFunction(_atMaybeArray(_ref3 = db.query().rows).call(_ref3, 0))).call(_ref, -1);