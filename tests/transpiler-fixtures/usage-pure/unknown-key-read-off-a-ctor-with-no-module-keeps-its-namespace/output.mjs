import _globalThis from "@core-js/pure/actual/global-this";
// a key nothing names may read any static of the constructor it is read off, so a constructor core-js
// defines no module for loads its namespace there however the read is spelled: off a realm hop, by a
// destructuring assignment, by a pattern nested under the realm, by a parameter its caller hands it to
// and off a parameter it is the default of
export const viaRealm = _globalThis.String[key];
let assigned;
({
  [key]: assigned
} = Array);
const {
  [key]: nested
} = _globalThis.JSON;
function pick({
  [key]: got
}) {
  return got;
}
export const viaParameter = pick(Math);
export function viaDefault(name, Kind = Object) {
  return Kind[name];
}
export { assigned, nested };