import "core-js/modules/es.array.at";
// a numeric-literal computed-key write (o[0] = ...) targets a known index, not the named field
// x, so it is not an unenumerable channel - the o.x narrow survives and .at stays Array-only
const o = {
  x: [1, 2, 3]
};
o[0] = "ok";
o.x.at(-1);