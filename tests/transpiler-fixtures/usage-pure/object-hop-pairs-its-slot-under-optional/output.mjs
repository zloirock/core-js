import _globalThis from "@core-js/pure/actual/global-this";
// A sole-key object hop pairs with the slot it names, like an array wrapper with its element.
// Pure getters may collapse; effectful getters keep their reads and use the actual slot's identity
// to select the ponyfill. A later spread or unknown key keeps the runtime override in that choice.
// A constructor escaping through the getter includes its static methods.
const other = {};
// ... and only while the slots stand: a name the file REPLACES holds the user's object, and the
// values are no longer one realm - the leaf below it stays native
_globalThis.window = {
  Map: other
};
let mutatedAlias = _globalThis;
mutatedAlias = window;
const {
  w: {
    Map: viaMutatedAlias
  }
} = {
  w: mutatedAlias
};
let underOptional = other;
export default [viaMutatedAlias];