import _includes from "@core-js/pure/actual/instance/includes";
// TS `satisfies` wraps the instance-method member expression and preserves its receiver.
// Removing the wrapper lets the instance call use the polyfill with the same `this`.
_includes(arr).call(arr, 1);