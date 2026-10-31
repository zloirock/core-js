// An escaping reference answers for the value the REALM holds under that name, never for the spelling: a leaf resolving to a
// binding this file wrote hands out that binding, so the constructor's family is not owed and the read below keeps its own module
// alone.
function hand(x) {
  globalThis.taken = x;
}
// a callee that hands its argument straight BACK is not where a value leaves - but the CALL is then
// the value, and it leaves here, so the family is owed exactly as it is for the bare reference
const identity = x => x;
hand(identity(Number));
