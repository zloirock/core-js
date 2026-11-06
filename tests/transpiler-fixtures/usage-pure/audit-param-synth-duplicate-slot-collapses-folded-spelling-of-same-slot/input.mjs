// the spellings need not match in kind: a folded computed key names the same slot as a plain one
const foldedSpellingOfSameSlot = (function ({ 'values': v1, ['val' + 'ues']: v2 } = Object) {
  return [v1, v2];
})();
export { foldedSpellingOfSameSlot };
