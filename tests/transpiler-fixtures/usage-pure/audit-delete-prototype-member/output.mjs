import _Map from "@core-js/pure/actual/map/constructor";
// `delete X.prototype.method` operand: the method name is preserved verbatim, only
// the receiver gets the standard polyfill rewrite.
delete _Map.prototype.has;
delete Array.prototype.includes;