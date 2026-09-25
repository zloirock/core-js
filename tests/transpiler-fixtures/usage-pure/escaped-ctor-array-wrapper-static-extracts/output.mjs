import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise$race from "@core-js/pure/actual/promise/race";
// a constructor the file hands out takes the whole entry, and a static destructured through an ARRAY
// wrapper of a slot holding it extracts like the plain-slot and the member spellings do: the pure
// constructor minted into that slot is the source's global, never an explicit receiver of its own
hand(_Promise);
const list = [{
  P: _Promise
}];
const race = _Promise$race;
const box = {
  P: _Promise
};
const {
  P: {
    any
  }
} = {
  P: {
    any: _Promise$any
  }
};
export const viaMember = _Promise$allSettled;
export { race, any };