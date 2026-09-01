import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// a single constructor hop under a proxy root anchors its residual on the ponyfill constructor -
// unless an opt-out sits on the hop line or on a leaf under it: a static the directive kept from
// importing is missing on the ponyfill, so the residual has to stay the user's raw read off the
// realm object, where the native still is. the undirected twin below still extracts
const {
  // core-js-disable-next-line
  Map: {
    groupBy: hopOptOut
  }
} = globalThis;
const {
  Object: {
    // core-js-disable-next-line
    groupBy: leafOptOut
  }
} = globalThis;
const {
  Array: {
    from: live
  }
} = globalThis;
use(hopOptOut, leafOptOut, live);