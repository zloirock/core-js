import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// nested proxy-global destructure assignment с двумя outer props без rest spread. оба
// inner-имени (Array.from, Object.fromEntries) полифилл-eligible; обе assignments должны
// эмититься independent; пустая destructure удаляется (без consumers)
let from, fromEntries;
from = _Array$from;
fromEntries = _Object$fromEntries;