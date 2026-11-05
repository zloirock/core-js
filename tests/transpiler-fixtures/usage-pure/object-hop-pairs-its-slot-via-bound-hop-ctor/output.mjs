import _globalThis from "@core-js/pure/actual/global-this";
// A bound computed object key names the same literal slot as its string spelling.
// The nested constructor read remains native.
const hopSlot = 'w';
const {
  [hopSlot]: {
    Map: viaBoundHopCtor
  }
} = {
  w: _globalThis
};
export default [viaBoundHopCtor];