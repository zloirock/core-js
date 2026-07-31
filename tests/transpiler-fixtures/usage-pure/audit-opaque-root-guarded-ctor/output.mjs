import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// a CTOR read under the opaque-root guard. separate file: babel@7's generator drops the parens
// around an optional-chain NEW callee on reprint (AST keeps extra.parenthesized - verified on the
// raw @babel/generator@7.29.7), which @7 re-parses as `(new q())?...` - so only THIS fixture sits
// in the v7 skip-list and the sibling guarded-static forms keep their v7 coverage
const q = () => _globalThis;
export const viaGuardedCtor = new (null == q()?.window ? void 0 : _Map)([[1, 2]]);