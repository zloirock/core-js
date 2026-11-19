import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// The selected value needs its static entry or instance dispatch.
// Preserve the user branch and evaluate every key and receiver once.
const receiver = flag ? Object : user;
const entries = receiver === Object ? _Object$entries : _entries(receiver);
export { entries };