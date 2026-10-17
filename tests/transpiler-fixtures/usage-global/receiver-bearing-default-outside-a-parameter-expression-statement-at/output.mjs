import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
const src = {};
function use() {/* empty */}
function raise() {/* empty */}
const {
  i3: {
    at
  } = raise()
} = src;
use(at);