// a TAGGED-TEMPLATE invocation hands the function its strings array in slot 0, so the parameter's own
// default never fires and every leaf is read off that array. the caller-lossy emissions - here the body
// extract, picked because the rest sibling leaves the caller-correct synth nothing it can replay - would
// bind the leaf to the polyfill on every entry and lose what the array carries, so they stay off. the
// NAMED expression bails for the same reason as the anonymous one beside it: a function expression's own
// name binds INSIDE it, so an empty reference set for that name says the function never recurses, never
// that no caller exists. the CALL-shaped invocation is the contrast - its own argument list is what the
// emissions read, and the extract fires there
const tagged = (function tag({ from, ...rest } = Array) { return [from, rest]; })`x`;
const anonymous = (function ({ from, ...rest } = Array) { return [from, rest]; })`y`;
const invoked = (function keep({ of, ...others } = Array) { return [of, others]; })();
export default [anonymous, invoked, tagged];
