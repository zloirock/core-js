// ... and where the receiver is genuinely UNKNOWN the generic dispatcher IS the answer: the catch
// parameter names a thrown value, and the slot fold takes two arms of different families
const catchParam = (function () {
  try {
    throw { y: 'ab' };
  } catch ({ y: { at } }) {
    return at;
  }
})();
export { catchParam };
