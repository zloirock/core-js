import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a `||` / `??` parameter default whose left always yields a constructor through a call, an IIFE, a static container's
// slot or a class static becomes the literal that left mirrors, its other keys read off the left re-spelled -
// in an exported function, whose callers nothing sees, as in a local one; a dead prefix of the left drops
const mkM = () => _Map;
const box = {
  U: _Map
};
class K {
  static U = _Map;
}
export function viaCall({
  groupBy,
  prototype
} = {
  groupBy: _Map$groupBy,
  prototype: mkM().prototype
}) {
  return [groupBy, prototype];
}
export function viaIife({
  groupBy,
  prototype
} = {
  groupBy: _Map$groupBy,
  prototype: (() => _Map)().prototype
}) {
  return [groupBy, prototype];
}
export function viaSlot({
  groupBy,
  prototype
} = {
  groupBy: _Map$groupBy,
  prototype: box.U.prototype
}) {
  return [groupBy, prototype];
}
export function viaStatic({
  groupBy,
  prototype
} = {
  groupBy: _Map$groupBy,
  prototype: K.U.prototype
}) {
  return [groupBy, prototype];
}
export function viaSequence({
  groupBy,
  prototype
} = {
  groupBy: _Map$groupBy,
  prototype: mkM().prototype
}) {
  return [groupBy, prototype];
}
function local({
  groupBy,
  prototype
} = {
  groupBy: _Map$groupBy,
  prototype: mkM().prototype
}) {
  return [groupBy, prototype];
}
export const viaLocal = local();