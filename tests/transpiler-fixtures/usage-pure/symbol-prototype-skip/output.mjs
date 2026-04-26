import _Symbol from "@core-js/pure/actual/symbol/constructor";
// `.prototype` access on a constructor is not routed to instance polyfill dispatch;
// `Symbol` receiver itself still gets the constructor polyfill.
_Symbol.prototype;
Array.prototype;