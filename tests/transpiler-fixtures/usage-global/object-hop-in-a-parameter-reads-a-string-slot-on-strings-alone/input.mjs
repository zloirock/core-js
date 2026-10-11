// a parameter's slot answers through the flat parameter meta - its default, or the argument an IIFE
// passes: a string in the slot dispatches the leaf's key on strings alone, with no array row beside it
function paramStringSlot({ w: { at: stringAt } } = { w: 'ab' }) {
  return stringAt;
}
const iifeStringSlot = (({ w: { includes: m } }) => m)({ w: 'ab' });
export default [paramStringSlot(), iifeStringSlot];
