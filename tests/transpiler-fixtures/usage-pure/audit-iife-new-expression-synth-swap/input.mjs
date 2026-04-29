// `new (() => ...)()` throws at runtime (arrows are not constructors),
// but the receiver-substitution still runs on the `new` form so the
// static-method polyfill stays wired into the argument.
const r = new (({ from }) => from([1, 2, 3]))(Array);
export { r };
