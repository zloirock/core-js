// Several pattern props may name ONE runtime slot.
const duplicateUnresolvedSlot = (function ({ 'z': z1, 'z': z2, from, of } = Array) {
  return [from, of, z1, z2];
})();
export { duplicateUnresolvedSlot };
