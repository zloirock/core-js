// A realm key whose slot the build leaves to the engine, its level defaulted, beside a sibling the build
// claims: an engine lacking the global runs the default, so its static keeps its module (`Array.from`)
const { Float16Array: { from } = Array, Map: M } = globalThis;
export { from, M };
