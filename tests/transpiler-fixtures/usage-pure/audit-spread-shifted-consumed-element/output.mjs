import _at from "@core-js/pure/actual/instance/at";
// a SPREAD ahead of the consumed element makes the PAIRING runtime-uncertain: the slot may hold
// any of the spread's own items, so no substituted binding can stand for it. what still stands is
// the slot ITSELF - renaming it to a minted name keeps the iteration and hands the dispatch
// whatever the source's own slot received, spread or not, so the claim resolves without ever
// asking which element that was
const [, _ref] = [...xs, arr];
const m = _at(_ref);
use(m);