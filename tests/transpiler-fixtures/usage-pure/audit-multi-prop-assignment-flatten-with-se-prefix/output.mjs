import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// destructure assignment с side-effect-bearing receiver и двумя полифилл-eligible outer
// props без rest spread. side-effect лифтится как отдельный statement до полифилл-assigns;
// пустая destructure удаляется (без consumers)
let from, fromEntries;
sideEffect();
from = _Array$from;
fromEntries = _Object$fromEntries;