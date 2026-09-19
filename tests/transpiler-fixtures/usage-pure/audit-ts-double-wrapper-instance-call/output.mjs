import _includes from "@core-js/pure/actual/instance/includes";
// instance call wrapped in two layers of TS expression wrappers: both layers are
// peeled to recognise the polyfillable call.
_includes(arr).call(arr, "x");