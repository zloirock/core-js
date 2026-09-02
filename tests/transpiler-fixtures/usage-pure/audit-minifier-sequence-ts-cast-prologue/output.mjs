import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$keys from "@core-js/pure/actual/object/keys";
// a minifier-sequence split promotes each EFFECTFUL operand to its own statement; a string
// operand is quiet and leaves no statement at all - cast-wrapped or not, since the cast vanishes
// at the TS strip - so a leading string never reaches a prologue position where it would re-parse
// as a directive ("use strict" flips the file strict). both legs print nothing for it, parens or no
from = _Array$from;
use(from([1, 2]));
arrOf = _Array$of;
use(arrOf(1, 2));
({
  isArray: isArr
} = Array);
use(isArr(x));
objKeys = _Object$keys;
use(objKeys(x));