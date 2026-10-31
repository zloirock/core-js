import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// a bodyless `var` whose nested instance read carries the whole init runs the init's effect prefix once:
// the dispatch spells the prefix with the receiver, so nothing lifts it a second time
export function pick(ready, log, list) {
  if (ready) var {
    C: {
      at
    }
  } = (log('at'), {
    C: list
  });else var {
    C: {
      D: {
        flat
      }
    }
  } = (log('flat'), log('again'), {
    C: {
      D: []
    }
  });
  return [at, flat];
}