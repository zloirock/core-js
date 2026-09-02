import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// the point query names what a write through a PARAMETER reaches, and it names it from the two
// halves the census pairs: the parameter's own default, and the argument a call hands the method
// its key names. so the known narrow on `Array.from` drops and the `.at` dispatch widens - a file
// whose ONLY mutation is one of these shapes is where that pairing is the whole answer
const xs = [];
function withDefault(ctor = Array) {
  ctor.from = patch;
}
withDefault();
Array.from(xs).at(0);