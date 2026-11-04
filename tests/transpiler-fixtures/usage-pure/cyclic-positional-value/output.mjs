import _at from "@core-js/pure/actual/instance/at";
// A self-referencing positional var remains unknown without recursing during analysis.
var [saved] = [saved];
_at(saved).call(saved, 0);