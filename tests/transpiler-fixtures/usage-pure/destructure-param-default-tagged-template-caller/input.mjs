// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const tagged = (function tag({ from, ...rest } = Array) { return [from, rest]; })`x`;
const anonymous = (function ({ from, ...rest } = Array) { return [from, rest]; })`y`;
const invoked = (function keep({ of, ...others } = Array) { return [of, others]; })();
export default [anonymous, invoked, tagged];
