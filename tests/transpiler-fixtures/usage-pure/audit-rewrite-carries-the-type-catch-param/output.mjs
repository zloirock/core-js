import _at from "@core-js/pure/actual/instance/at";
// ... and where the receiver is genuinely UNKNOWN the generic dispatcher IS the answer: the catch
// parameter names a thrown value, and the slot fold takes two arms of different families
const catchParam = function () {
  try {
    throw {
      y: 'ab'
    };
  } catch (_ref) {
    let at = _at(_ref.y);
    return at;
  }
}();
export { catchParam };