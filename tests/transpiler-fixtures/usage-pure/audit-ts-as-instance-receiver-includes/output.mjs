import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// TS `as` cast on an instance-method receiver: the cast is peeled so the instance
// call is rewritten through the polyfill.
_includes(_ref = obj as any).call(_ref, "x");