import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// resolving an identifier down to the global-proxy ROOT is ONE surface with several arm shapes -
// each cell pins one arm. positives inject the arm-only marker; the negative arm must NOT register
// a ctor alias (named keys off an array literal are always undefined)
import g from "@core-js/pure/actual/global-this";
export const viaImportMember = g.Map.groupBy([], x => x);