// A realm-valued logical expression in a literal slot keeps its native Map read.
// Deciding the logical expression does not synthesize a constructor wrapper.
const { w: { Map: viaOrDefault } } = { w: globalThis || {} };
export default [viaOrDefault];
