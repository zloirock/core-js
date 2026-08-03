// a `symbol/` leaf that names no `Symbol.<key>` static must not attribute the symbol entry's
// modules to the `in` check - `symbol/constructor` binds the constructor and `symbol/description`
// exports nothing
import S from "core-js/actual/symbol/constructor";
import d from "core-js/actual/symbol/description";
const hasCtor = S in target;
const hasDesc = d in target;
target.at(0);
