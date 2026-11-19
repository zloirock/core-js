import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
// Shared readers capture the receiver after preceding effects; a sole read carries its prefix.
const lead = before(),
  {
    Array: {
      prototype: {
        at,
        includes
      }
    },
    Object: C
  } = (effect(), globalThis);
const {
  Array: {
    prototype: {
      flat
    }
  }
} = (another(), globalThis);
use(lead, at, includes, C, flat);