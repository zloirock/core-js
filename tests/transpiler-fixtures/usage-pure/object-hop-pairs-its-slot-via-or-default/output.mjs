import _globalThis from "@core-js/pure/actual/global-this";
// A realm-valued logical expression in a literal slot keeps its native Map read.
// Deciding the logical expression does not synthesize a constructor wrapper.
const {
  w: {
    Map: viaOrDefault
  }
} = {
  w: _globalThis
};
export default [viaOrDefault];