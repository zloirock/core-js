import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// the same pairing named by a METHOD's key: the declaration side and the call side spell the owner
// the same way, so `handler.take(Array)` reaches the parameter `handler.take` writes through. the
// file's only mutation is that one, which is what makes the pairing the whole answer here
const xs = [];
const handler = {
  take(ctor) {
    ctor.from = patch;
  }
};
handler.take(Array);
Array.from(xs).at(0);