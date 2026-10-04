// TS `satisfies` wraps the instance-method member expression and preserves its receiver.
// Removing the wrapper lets the instance call use the polyfill with the same `this`.
(arr.includes satisfies any)(1);
