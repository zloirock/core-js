import "core-js/modules/es.array.at";
// a static-literal computed-key write (`o['y'] = ...`) touches a KNOWN field, not `x`, so it is
// not an unenumerable channel - the `o.x` narrow survives and `.at` stays Array-only
const o = {
  x: [1, 2, 3]
};
o["y"] = "ok";
o.x.at(-1);