import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
// One pattern writing a binding twice keeps the source's last write. A claim whose extraction would
// land before an earlier write of the same target - or behind a later one, where a nested claim on
// an assignment is overwritten after the statement - keeps its native read. Two claims on one level
// are written in turn, so both still extract.
let last, len, pair;
({
  length: last,
  from: last
} = Array);
({
  w: {
    at: len,
    length: len
  }
} = {
  w: []
});
const _ref = [];
pair = _flatMaybeArray(_ref);
pair = _flatMapMaybeArray(_ref);
export { last, len, pair };