// `delete X.prototype.method` operand: the method name is preserved verbatim, only
// the receiver gets the standard polyfill rewrite.
delete Map.prototype.has;
delete Array.prototype.includes;
