// A var overwritten in its declaring block no longer owes the old built-in static.
const reassignRoot = Object;
export function viaVarReassignedInBlock() {
  { var reassignHeld = reassignRoot; reassignHeld = {}; }
  { const { fromEntries } = reassignHeld; return fromEntries([]); }
}
