// a BARE constructor under a sole wrapper: the element's prefix lifts, a trailing neighbour lifts
// behind it, and the wrapper drops - the shape the nested static prints for the same neighbours;
// a constructor stored with its own effect prefix classifies by the tail and the write rides the
// extraction whole
const seen = [];
const eff = t => (seen.push(t), t);
const xs = [1];
let kw;
const [{ assign }] = [(eff('e'), Object)];
const [{ is }] = [Object, eff('f')];
const [{ values }] = [(eff('g'), Object), eff('h')];
const [{ getOwnPropertySymbols }] = [kw = (eff('t'), Object)];
export { assign, is, values, getOwnPropertySymbols, seen, kw };
