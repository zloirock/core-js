import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// A retained nested claim shares the earlier flat claim's receiver and initializer.
// The prefix executes once, before either property read.
export function readCaptured(box, effect) {
  let at, flat;
  ({
    at,
    M: {
      flat
    }
  } = (effect(), box));
  return [at, flat];
}