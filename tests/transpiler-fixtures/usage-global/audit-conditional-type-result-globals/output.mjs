import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Conditional result arms describe values that may flow through the annotation.
// Their globals retain the normal usage-global annotation injection policy.
declare const matched: string extends string ? Number : boolean;
declare const unmatched: string extends boolean ? boolean : Map<string, number>;
export { matched, unmatched };