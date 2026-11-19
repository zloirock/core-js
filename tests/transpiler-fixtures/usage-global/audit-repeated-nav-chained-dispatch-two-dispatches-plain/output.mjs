import "core-js/modules/es.array.at";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// a dispatch CHAINED over another one memoizes the inner result, so the receiver text that holds
// the navs lives in the OUTER emission rather than in the inner transform. an inner rewrite whose
// range nests inside the already-substituted one still owes that text its render - concluding
// absorption from the enclosure alone left these reads native
globalThis.chainBox = {
  n: 4,
  list: ['ab', 'cd']
};
export const twoDispatchesPlain = globalThis.window?.self.chainBox.list?.at(1)?.slice(0).length;