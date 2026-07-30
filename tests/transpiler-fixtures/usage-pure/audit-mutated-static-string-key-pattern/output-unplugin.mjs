// a MUTATED static bails the synth under EVERY spelling of its key: the patch must win, and the
// string spelling names the same slot the identifier does. isolated in its own fixture - the
// mutation deopts the pair file-wide by design and would silence sibling cells
Array.from = Array.from;
const viaIdentifierKey = (function ({ from } = Array) {
  return from;
})();
// eslint-disable-next-line @stylistic/quote-props -- the string spelling of the mutated key is under test
const viaStringKey = (function ({ 'from': f } = Array) {
  return f;
})();
export { viaIdentifierKey, viaStringKey };