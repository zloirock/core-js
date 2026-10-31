import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A repeated binding read owns no copy of the retained target's comments.
// Keep each annotation once and in source order.
let method;
({
  [(effect(), Symbol.iterator)]: /* target annotation */method = /* default annotation */fallback()
} = globalThis);