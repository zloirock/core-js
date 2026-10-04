import _at from "@core-js/pure/actual/instance/at";
// Pure captures a call-rooted receiver after the final import.
// An initless var between source imports must not split that import region.
import "x";
var sentinel;
import "y";
var _ref;
const result = _at(_ref = readReceiver()).call(_ref, -1);