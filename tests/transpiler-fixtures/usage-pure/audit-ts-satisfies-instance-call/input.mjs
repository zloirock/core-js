// TS `satisfies` cast on an instance-method receiver: the cast is peeled so the
// instance call is rewritten through the polyfill.
(arr.includes satisfies any)(1);
