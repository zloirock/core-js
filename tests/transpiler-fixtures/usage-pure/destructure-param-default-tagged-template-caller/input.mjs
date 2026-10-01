// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const tagged = (function tag({ from, ...rest } = Array) { return [from, rest]; })`x`;
const anonymous = (function ({ from, ...rest } = Array) { return [from, rest]; })`y`;
const invoked = (function keep({ of, ...others } = Array) { return [of, others]; })();
export default [anonymous, invoked, tagged];
