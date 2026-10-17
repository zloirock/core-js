// A returned constructor escapes through its consumed call result and widens the family.
function hand(x) {
  globalThis.taken = x;
}
const identity = x => x;
hand(identity(Number));
export const rounded = Number.parseFloat('1.5');
