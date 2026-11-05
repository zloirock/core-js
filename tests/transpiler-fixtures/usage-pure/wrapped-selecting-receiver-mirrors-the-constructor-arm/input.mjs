// Supported selecting extraction serves only the chosen constructor branch through wrapper levels.
// User branches, receiver defaults and source effects retain their own values and order.
const [{ of: viaElementDefault } = {}] = [c ? Array : userObj];
const [{ from: viaAnd }] = [c && Array];
const [{ trunc: viaPrefix }] = [(mark++, c ? Math : userObj)];
const viaIife = (([{ fromEntries: fe }]) => fe)([c ? Object : userObj]);
const [[{ groupBy: viaDouble }]] = [[c ? Object : userObj]];
const [{ w: { sign: viaArrayKeyed } }] = [{ w: c ? Math : userObj }];
const { w: { assign: viaHopDefault } = {} } = { w: c ? Object : userObj };
const { 0: { defineProperties: viaIndexKey } } = [c ? Object : userObj];
const { ['w']: { create: viaComputedHop } } = { w: c ? Object : userObj };
const { w: { seal: viaGetter } } = { get w() { return c ? Object : userObj; } };
const { w: { hasOwn: viaHopDefaultPlain } = {} } = { w: Object };
export {
  viaElementDefault,
  viaAnd,
  viaPrefix,
  viaIife,
  viaDouble,
  viaArrayKeyed,
  viaHopDefault,
  viaIndexKey,
  viaComputedHop,
  viaGetter,
  viaHopDefaultPlain,
};
