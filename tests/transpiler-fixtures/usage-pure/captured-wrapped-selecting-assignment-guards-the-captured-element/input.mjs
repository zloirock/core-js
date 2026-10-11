// a CAPTURED assignment yields the receiver itself, so a mirrored arm would change the captured value: the
// wrapped spelling takes the ordered capture, its guard over the captured element and the right side as
// its value, and the keyed one stays raw
let cp, ck;
const viaCaptured = ([{ getPrototypeOf: cp }] = [c ? Object : userObj]);
const viaCapturedKeyed = ({ w: { defineProperty: ck } } = { w: c ? Object : userObj });
export { viaCaptured, viaCapturedKeyed, cp, ck };
