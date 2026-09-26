// a constructor the file hands out takes the whole entry, and a static destructured through an ARRAY
// wrapper of a slot holding it extracts like the plain-slot and the member spellings do: the pure
// constructor minted into that slot is the source's global, never an explicit receiver of its own
hand(Promise);
const list = [{ P: Promise }];
const [{ P: { race } }] = list;
const box = { P: Promise };
const { P: { any } } = box;
export const viaMember = box.P.allSettled;
export { race, any };
