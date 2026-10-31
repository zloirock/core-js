import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `delete (Map as any).prototype` / `delete (obj.at as any)` / `delete obj.includes!`: the TS
// wrappers must be peeled, but the operands stay verbatim because a `delete` operand cannot be
// polyfill-rewritten.
delete (Map as any).prototype;
// @ts-expect-error a delete tsc refuses is the shape under test
delete (obj.at as any);
// @ts-expect-error a delete tsc refuses is the shape under test
delete obj.includes!;