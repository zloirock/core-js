// TS `as` cast on an instance-method receiver: the cast is peeled so the instance
// call is rewritten through the polyfill.
(obj as any).includes("x");
