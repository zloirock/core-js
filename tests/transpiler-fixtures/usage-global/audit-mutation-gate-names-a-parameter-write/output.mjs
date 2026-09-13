import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// A parameter default can supply the constructor whose named static the body patches.
// The later at call must allow the replacement to return either an array or a string.
// The write alone does not release Array; pure retains the patched Array.from read.
const xs = [];
function withDefault(ctor = Array) {
  ctor.from = patch;
}
withDefault();
Array.from(xs).at(0);