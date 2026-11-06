// Bare constructors inside literal arrays keep their native static reads.
// Leading and trailing effects and the receiver store stay in their original slots.
const seen = [];
const eff = t => (seen.push(t), t);
const xs = [1];
let kw;
const [{ assign }] = [(eff('e'), Object)];
const [{ is }] = [Object, eff('f')];
const [{ values }] = [(eff('g'), Object), eff('h')];
const [{ getOwnPropertySymbols }] = [kw = (eff('t'), Object)];
export { assign, is, values, getOwnPropertySymbols, seen, kw };
