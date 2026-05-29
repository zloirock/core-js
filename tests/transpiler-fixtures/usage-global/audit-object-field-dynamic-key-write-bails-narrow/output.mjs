import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// a dynamic computed-key write (`o[key] = ...`) can hit any field, including `x`, through a
// channel field-flow can't enumerate - so the `o.x` narrow must bail and `.at` stays generic
// (Array|String) rather than narrowing to Array-only off the literal initializer
const o = {
  x: [1, 2, 3]
};
o[key] = "overwrite";
o.x.at(-1);