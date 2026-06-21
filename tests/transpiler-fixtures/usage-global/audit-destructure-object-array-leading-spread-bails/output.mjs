import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Object-outer / Array-inner destructure with leading-spread inside the inner array. the
// `a` property's value `[...spread, 'x']` has the same runtime-uncertainty as the nested-
// array case: position 1 can be a spread element or the trailing 'x'. composing the
// object-key step ('a') with the numeric step (1) must still hit the spread-guard bail.
// symmetric with the nested-array case but reaches the numeric step via property access.
declare const spread: number[];
const {
  a: [, b]
} = {
  a: [...spread, 'x']
};
const c = 42;
b.at(-1);
c.toFixed(2);