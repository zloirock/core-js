import _Map from "@core-js/pure/actual/map";
// The slot read through the value canon at every depth, on every host: a NESTED comma run, a defensive realm default (`?? {}`, `||
// {}`, nested), a `?.` off a guaranteed realm name - each is the value the flat spelling reads, and the ASSIGNMENT host reads it
// the same way.
const {
  w: {
    Map: viaOrDefault
  }
} = {
  w: {
    Map: _Map
  }
};
export default [viaOrDefault];