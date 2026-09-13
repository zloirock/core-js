import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// A local method receives Array and writes its named static. The mutation must widen
// the later at call without treating the argument as a released constructor.
// Pure retains the patched Array.from read.
const xs = [];
const handler = {
  take(ctor) {
    ctor.from = patch;
  }
};
handler.take(Array);
Array.from(xs).at(0);