// nested destructure with a side-effecting computed key (`[(eff(), "from")]`) resolving to a
// polyfillable static through a static-object wrapper. both plugins keep the key IN PLACE (value renamed
// to a throwaway, effect once) and bind the polyfill separately - identical handling to the non-nested
// case (one residual path) - so the polyfill ALWAYS wins (a present-but-buggy native is replaced too)
const { x: { [(effectful(), "from")]: f } } = { x: Array };
const doubled = [1, [2]].flat();
