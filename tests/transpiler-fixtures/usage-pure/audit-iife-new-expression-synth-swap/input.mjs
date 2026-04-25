// `new` invocation of an arrow IIFE - despite the runtime TypeError this incurs (arrows are
// not constructable), the destructure-receiver detection still walks through NewExpression
// the same way it walks through CallExpression. synth-swap rewrites the receiver argument
// so the static-method polyfill is wired before the eventual runtime failure
const r = new (({ from }) => from([1, 2, 3]))(Array);
export { r };
