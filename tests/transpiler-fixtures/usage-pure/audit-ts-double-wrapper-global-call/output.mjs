import _Map from "@core-js/pure/actual/map/constructor";
// global call wrapped in two layers of TS expression wrappers: both layers are peeled
// to recognise the polyfillable call.
_Map();