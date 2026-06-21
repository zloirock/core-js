import _at from "@core-js/pure/actual/instance/at";
var _ref;
// instance-method destructure with a default value inside a bodyless `if`. the deferred emit
// captures the scope at visit time and replays it at flush time; the snapshot is scope-only
// (no body-wrap), so the generated `var _ref;` hoists to the enclosing scope rather than
// producing a nested wrap around the flattened block.
if (cond) var at = (_ref = _at(getObj())) === void 0 ? () => 0 : _ref;