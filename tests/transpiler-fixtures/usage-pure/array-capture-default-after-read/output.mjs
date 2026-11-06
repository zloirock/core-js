import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A later default must observe the earlier binding, never run in a preceding capture.
const flat = _flatMaybeArray(receiver);
const [{}, last = fallback(flat)] = [receiver, source];
consume(flat, last);