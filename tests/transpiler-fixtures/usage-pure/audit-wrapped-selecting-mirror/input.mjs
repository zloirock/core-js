// a SELECTING receiver under a WRAPPER mirrors per branch the way the bare init does: the host's
// literal pairs the level's slot - an element by position, a property by its plain key - and the
// polyfill lands in the constructor arm alone, the user arm staying raw. one static per row, so a
// row's mirror is attributable to its own host shape
const [{ of: viaElementDefault } = {}] = [c ? Array : userObj];
const [{ from: viaAnd }] = [c && Array];
const [{ trunc: viaPrefix }] = [(mark++, c ? Math : userObj)];
function viaParamDefault([{ entries: e }] = [c ? Object : userObj]) { return e; }
const viaIife = (([{ fromEntries: fe }]) => fe)([c ? Object : userObj]);
const [[{ groupBy: viaDouble }]] = [[c ? Object : userObj]];
const { w: { keys: viaKeyed } } = { w: c ? Object : userObj };
const { w: [{ values: viaKeyedArray }] } = { w: [c ? Object : userObj] };
const [{ w: { sign: viaArrayKeyed } }] = [{ w: c ? Math : userObj }];
const { w: { assign: viaHopDefault } = {} } = { w: c ? Object : userObj };
const { 0: { defineProperties: viaIndexKey } } = [c ? Object : userObj];
// ... and a hop default over a PLAIN constructor level is dead text: the extraction consumes the
// whole pattern and the emptied host leaves with it, on both legs
const { w: { hasOwn: viaHopDefaultPlain } = {} } = { w: Object };
export {
  viaElementDefault,
  viaAnd,
  viaPrefix,
  viaParamDefault,
  viaIife,
  viaDouble,
  viaKeyed,
  viaKeyedArray,
  viaArrayKeyed,
  viaHopDefault,
  viaIndexKey,
  viaHopDefaultPlain,
};

// the mirror swaps the arm IN PLACE and keeps the level whole, so what a dropping consumer has to
// refuse stays pairable here: an INLINE-array spread is a longer literal, a later spread or a key
// nothing names overrides the mirrored slot exactly as it overrides the source's (last wins)
const [{ hasOwn: viaSpreadShift }] = [...[c ? Object : userObj]];
const [, { getOwnPropertyNames: viaSpreadAhead }] = [...[0], c ? Object : userObj];
const { w: { is: viaSpreadLevel } } = { w: c ? Object : userObj, ...more };
const { w: { freeze: viaLaterKey } } = { w: c ? Object : userObj, [k]: 1 };
export { viaSpreadShift, viaSpreadAhead, viaSpreadLevel, viaLaterKey };

// NEGATIVES: a spread of a BINDING shifts the element by a length nothing here knows; a getter's
// value is a body; a computed hop key is no spelling to pair by
let cp, ck;
const [{ isFrozen: viaSpreadAlias }] = [...wrapped];
const { w: { seal: viaGetter } } = { get w() { return c ? Object : userObj; } };
const { w: { isSealed: viaGetterLast } } = { w: c ? Object : userObj, get w() { return userObj; } };
const { ['w']: { create: viaComputedHop } } = { w: c ? Object : userObj };
// ... and a CAPTURED assignment yields the receiver itself, so a mirrored arm would change the
// captured value - wrapped or flat, the assignment stays raw
const viaCaptured = ([{ getPrototypeOf: cp }] = [c ? Object : userObj]);
const viaCapturedKeyed = ({ w: { defineProperty: ck } } = { w: c ? Object : userObj });
export { viaSpreadAlias, viaGetter, viaGetterLast, viaComputedHop, viaCaptured, viaCapturedKeyed, cp, ck };
