// A static patch through a canonical string index reaches the same constructor slot.
const patchedString = [Object];
patchedString['0'].values = function () {
  return [];
};
const patchedStringSpellingStaysNative = function () {
  const {
    0: {
      values
    }
  } = patchedString;
  return values;
}();
export { patchedStringSpellingStaysNative };