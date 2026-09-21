// Array-wrapped statics preserve leading and trailing element effects in source order.
// A receiver stored by assignment retains its original value before the pure binding is read.
const seen = [];
const eff = t => (seen.push(t), t);
const xs = [1];
let kw;
const [{ assign }] = [(eff('e'), Object)];
const [{ is }] = [Object, eff('f')];
const [{ values }] = [(eff('g'), Object), eff('h')];
const [{ getOwnPropertySymbols }] = [kw = (eff('t'), Object)];
export { assign, is, values, getOwnPropertySymbols, seen, kw };
