import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A value sitting in a position that CONSUMES it opens no write channel: a bare statement and an untagged template's coercion
// evaluate it and leave nothing able to reach it, so the narrow holds.
const statementPosition = {
  rows: [1, 2],
  read() {
    var _ref;
    return _atMaybeArray(_ref = this.rows).call(_ref, 0);
  }
};
statementPosition;