import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
var _ref, _ref2;
// a CAPTURED assignment yields the receiver itself, so a mirrored arm would change the captured value: the
// wrapped spelling takes the ordered capture, its guard over the captured element and the right side as
// its value, and the keyed one stays raw
let cp, ck;
const viaCaptured = ([_ref] = _ref2 = [c ? Object : userObj], cp = _ref === Object ? _Object$getPrototypeOf : _ref.getPrototypeOf, _ref2);
const viaCapturedKeyed = {
  w: {
    defineProperty: ck
  }
} = {
  w: c ? Object : userObj
};
export { viaCaptured, viaCapturedKeyed, cp, ck };