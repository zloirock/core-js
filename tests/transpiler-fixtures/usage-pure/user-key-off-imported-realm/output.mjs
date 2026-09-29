// The realm read through an import of its own entry - a file this plugin already transformed, or
// the user's own pure import - is the same global object: a USER key off it stays a name match
// both legs keep native, on an assignment and on a loop head as on a declaration.
import realm from '@core-js/pure/actual/global-this';
export const {
  y: {
    at: declaredAt
  }
} = realm;
let assignedAt;
({
  Y: {
    at: assignedAt
  }
} = realm);
for (const {
  y: {
    at: loopAt
  }
} of [realm]) loopAt;
export { assignedAt };