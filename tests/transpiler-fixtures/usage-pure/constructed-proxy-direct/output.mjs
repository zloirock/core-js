import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A Proxy can expose methods outside its target's family.
// Even a known array target keeps the generic instance dispatcher.
_at(_ref = new Proxy([1, 2, 3], handler)).call(_ref, -1);