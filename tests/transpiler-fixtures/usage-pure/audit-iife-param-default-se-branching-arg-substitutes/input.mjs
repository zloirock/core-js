// usage-pure twin of the usage-global SE-branching arg case: an IIFE param-default destructure whose
// call-arg is an SE-prefixed BRANCHING receiver. pure classifies the arg by its peeled receiver value
// (not the raw sequence) and rewrites EACH reachable branch to its own ponyfill - the Iterator branch
// exposes `from` as the pure static, the Set branch keeps the pure ctor (its `.from` stays undefined,
// matching native). the destructure + call stay dynamic (no over-resolve), the leading SE runs. an
// unresolvable branch keeps its raw value. distinct method per line
export const a = (({ from } = Array) => from(items))((eff(), c ? Set : Iterator));
export const b = (({ fromEntries } = Array) => fromEntries(pairs))((log(), d ? Object : Map));
