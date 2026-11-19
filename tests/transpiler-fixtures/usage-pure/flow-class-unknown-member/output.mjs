import _at from "@core-js/pure/actual/instance/at";
var _ref;
// @flow
// Missing members keep the generic receiver fallback.
declare class C {}
_at(_ref = new C().m()).call(_ref, 0);