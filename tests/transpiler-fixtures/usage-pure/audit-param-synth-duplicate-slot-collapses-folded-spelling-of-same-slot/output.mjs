import _Object$values from "@core-js/pure/actual/object/values";
// the spellings need not match in kind: a folded computed key names the same slot as a plain one
const foldedSpellingOfSameSlot = function ({
  'values': v1,
  ['val' + 'ues']: v2
} = {
  'values': _Object$values
}) {
  return [v1, v2];
}();
export { foldedSpellingOfSameSlot };