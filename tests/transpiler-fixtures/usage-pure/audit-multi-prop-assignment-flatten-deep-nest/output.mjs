import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// 3-deep nested destructure assignment via alias-hop (globalThis.self.X.Y). both
// polyfills resolve through the self-alias receiver. each assignment emits independently;
// the empty destructure is removed
let from, fromEntries;
from = _Array$from;
fromEntries = _Object$fromEntries;