import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// a Flow cross-family union receiver dispatches through the generic runtime helper in
// pure (single import), same as the TS twin
declare var r: Array<number> | string;
_includes(_ref = r ?? 'f').call(_ref, 'x');