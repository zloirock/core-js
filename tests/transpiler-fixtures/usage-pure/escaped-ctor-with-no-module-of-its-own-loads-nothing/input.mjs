// a constructor core-js defines no module for stays the engine's own, so handing it to code this file
// does not see - a call, an export, a realm slot, a return - loads none of its static or prototype
// modules: those load where a read names them. a constructor core-js polyfills, handed out the same
// way, still loads its whole family
hand(String);
export const list = Array;
globalThis.slot = Object;
export function math() {
  return Math;
}
hand(Map);
