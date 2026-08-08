import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a CTOR read under the opaque-root guard. separate file: babel@7's generator drops the parens
// around an optional-chain NEW callee on reprint (AST keeps extra.parenthesized - verified on the
// raw @babel/generator@7.29.7), which @7 re-parses as `(new q())?...` - so only THIS fixture sits
// in the v7 skip-list and the sibling guarded-static forms keep their v7 coverage
const q = () => globalThis;
export const viaGuardedCtor = new (q()?.window?.Map)([[1, 2]]);