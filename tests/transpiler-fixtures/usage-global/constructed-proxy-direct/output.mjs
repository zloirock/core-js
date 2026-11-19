import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A Proxy can expose methods outside its target's family.
// Even a known array target keeps the generic instance dispatcher.
new Proxy([1, 2, 3], handler).at(-1);