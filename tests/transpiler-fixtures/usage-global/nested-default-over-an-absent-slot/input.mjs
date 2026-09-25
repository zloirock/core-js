// a nested pattern level's default is the receiver alone where the init's literal provably leaves the
// slot undefined - an absent key, a slot past an array's end, a `void` one - so only the default's
// family is owed; a slot something may still supply - a value, an inherited key, a spread - keeps both
function list() { return [1, 2]; }
const { A: { at } = list() } = {};
const [{ map } = list()] = [];
const { A: { filter } = list() } = { A: void 0 };
const { A: { find } = list() } = { A: source };
const { toString: { some } = list() } = {};
const { A: { every } = list() } = { ...rest };
use(at, map, filter, find, some, every);
