import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// A user conditional is evaluated once even when its live name looks global.
export function read(self, test) {
  const {
    at,
    includes
  } = test() ? void 0 : self;
  return [at, includes];
}