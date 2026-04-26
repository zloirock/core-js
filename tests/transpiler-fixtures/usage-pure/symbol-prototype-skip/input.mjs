// `.prototype` access on a constructor is not routed to instance polyfill dispatch;
// `Symbol` receiver itself still gets the constructor polyfill.
Symbol.prototype;
Array.prototype;
