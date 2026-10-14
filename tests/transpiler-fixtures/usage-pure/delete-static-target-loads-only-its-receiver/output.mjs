import _Map from "@core-js/pure/actual/map";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise from "@core-js/pure/actual/promise";
// a `delete` names its target without reading it, so the static it removes takes nothing of its own:
// only what is read on the way there does - the receiver, with its constructor family, and a member
// standing below the target. a sequence around the member makes it a value the operator never names
delete Array.from;
delete Array['of'];
delete Object.groupBy;
delete _Map.groupBy;
delete _Promise.allSettled;
delete _Object$entries.name;
delete (0, _Object$fromEntries);