import _includes from "@core-js/pure/actual/instance/includes";
// TS `as` cast on an instance-method receiver: the cast is peeled so the instance
// call is rewritten through the polyfill.
_includes(obj as any).call(obj as any, "x");