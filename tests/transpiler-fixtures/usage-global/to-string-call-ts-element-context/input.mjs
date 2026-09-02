// a receiver of a KNOWN type outside the hint domain (`Element`) walks the same type ladder a
// hinted one does: no variant specialises it, so the desc's `rest` answers - `object/to-string`,
// exactly what any hinted type without a variant of its own gets. the typed read used to bail with
// nothing, so more type information meant fewer injections and a missing polyfill on the target
// engine. a type needing no polyfill for the member says so in the data, with an empty variant
declare const el: Element;
el.toString();
