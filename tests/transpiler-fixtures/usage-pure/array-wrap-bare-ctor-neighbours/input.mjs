// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const seen = [];
const eff = t => (seen.push(t), t);
const xs = [1];
let kw;
const [{ assign }] = [(eff('e'), Object)];
const [{ is }] = [Object, eff('f')];
const [{ values }] = [(eff('g'), Object), eff('h')];
const [{ getOwnPropertySymbols }] = [kw = (eff('t'), Object)];
export { assign, is, values, getOwnPropertySymbols, seen, kw };
