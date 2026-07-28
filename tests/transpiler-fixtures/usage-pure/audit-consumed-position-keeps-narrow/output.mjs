import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a value sitting in a position that CONSUMES it opens no write channel: a bare statement and an
// untagged template's coercion evaluate it and leave nothing able to reach it, so the narrow holds.
// a TAGGED template is the boundary - the tag function receives the raw value. an assignment forwards
// the value on from its OWN position as well, so it keeps the narrow only while that position
// consumes it too. one row per verdict so each helper name is attributable
const statementPosition = {
  rows: [1, 2],
  read() {
    var _ref;
    return _atMaybeArray(_ref = this.rows).call(_ref, 0);
  }
};
statementPosition;
const taggedSubstitution = {
  cells: [1, 2],
  read() {
    var _ref2;
    return _at(_ref2 = this.cells).call(_ref2, 0);
  }
};
tag`${taggedSubstitution}`;
const assignedThenDropped = {
  slots: [1, 2],
  read() {
    var _ref3;
    return _includesMaybeArray(_ref3 = this.slots).call(_ref3, 1);
  }
};
let sink1;
sink1 = assignedThenDropped;
const assignedThenHandedOut = {
  items: [1, 2],
  read() {
    var _ref4;
    return _includes(_ref4 = this.items).call(_ref4, 1);
  }
};
let sink2;
sink(sink2 = assignedThenHandedOut);