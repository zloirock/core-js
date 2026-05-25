import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
b = Array || _Set;
// chain-assignment within destructure receiver: `b = (Array || Set)` evaluates to right-hand
// at runtime. fallback-receiver peel alternates chain-assign + paren + TS + safe-SE peels
// until stable. should classify both branches symmetrically (Array union Set both have from)
const from = _Array$from;
from;