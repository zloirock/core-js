// An unnamed static read may select any own static of its native global.
// Global usage loads those statics and their dependencies; prototype methods need separate usage.
// Member, destructured, inherited and parameter reads retain the same static obligation.
export const viaRealm = globalThis.String[key];
let assigned;
({ [key]: assigned } = Array);
const { JSON: { [key]: nested } } = globalThis;
function pick({ [key]: got }) {
  return got;
}
export const viaParameter = pick(Math);
export function viaDefault(name, Kind = Object) {
  return Kind[name];
}
export { assigned, nested };
