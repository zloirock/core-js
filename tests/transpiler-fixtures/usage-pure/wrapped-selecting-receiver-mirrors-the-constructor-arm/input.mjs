// a static-only key read through a wrapper level off a selecting receiver mirrors the constructor arm in
// place and leaves the user arm as written - an element, an `&&`, behind an effect prefix, an IIFE
// argument, two levels deep, under a key, an index, a hop default, a computed literal key or in a getter's
// returned value; a plain constructor level mirrors the same way, its hop default left dead
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
