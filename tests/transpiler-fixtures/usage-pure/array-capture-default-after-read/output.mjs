import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A later default must observe the earlier binding, never run in a preceding capture.
const [, _ref] = [receiver, source];
const flat = _flatMaybeArray(receiver);
const last = _ref === void 0 ? fallback(flat) : _ref;
consume(flat, last);