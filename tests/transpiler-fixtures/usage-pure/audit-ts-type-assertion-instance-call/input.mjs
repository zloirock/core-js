// TS type assertion on an instance-call receiver: the assertion is peeled so the
// instance call is rewritten through the polyfill.
(<any[]>arr).at(-1);
