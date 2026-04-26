import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// `var X = (X)` self-reference with parenthesised RHS: the parens must be peeled and
// the bare-identifier rewrite skipped to preserve TDZ semantics.
var Promise = _Promise;
_Promise$resolve(1);