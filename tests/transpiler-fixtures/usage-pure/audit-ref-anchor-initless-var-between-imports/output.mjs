import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// An initless var between source imports does not split the import region.
// This quiet primitive needs no memo; runtime-receiver-import-anchor locks memo insertion.
import "x";
var sentinel;
import "y";
const r = _atMaybeString("z").call("z", -1);