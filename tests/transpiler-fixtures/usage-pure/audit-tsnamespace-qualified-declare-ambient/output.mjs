import _Map from "@core-js/pure/actual/map/constructor";
// ambient `declare namespace Map.Y {}` has NO runtime emission - the qualified id must NOT be
// registered as a shadow (the declare-guard sits ahead of the leftmost-segment lookup), so global
// `Map` is still polyfilled. contrast the non-ambient form, which DOES shadow
declare namespace Map.Y {
  const z: number;
}
const a = new _Map();
export { a };