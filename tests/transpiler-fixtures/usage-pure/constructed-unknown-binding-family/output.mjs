import _at from "@core-js/pure/actual/instance/at";
// Capturing an external constructor's result preserves its unknown family across array and string.
const held = new ExternalList();
_at(held).call(held, -1);