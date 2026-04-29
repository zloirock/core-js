import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// 3-deep nested destructure assignment через alias-hop (globalThis.self.X.Y). два полифилла
// resolve через self-alias receiver. оба эмитятся independent; пустая destructure удаляется
let from, fromEntries;
from = _Array$from;
fromEntries = _Object$fromEntries;