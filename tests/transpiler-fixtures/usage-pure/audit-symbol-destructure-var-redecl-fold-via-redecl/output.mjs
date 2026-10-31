import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a bare same-name `var` redeclaration writes NO value, but the scope trackers record a
// phantom violation for it in parser-specific shapes (babel: the valueless declarator;
// estree: the redeclared identifier). the phantom must not poison the Symbol destructure
// alias - the extract folds and the use reads the well-known symbol on BOTH emitters
var iterator = _Symbol$iterator;
var iterator;
export const viaRedecl = _getIteratorMethod([]);