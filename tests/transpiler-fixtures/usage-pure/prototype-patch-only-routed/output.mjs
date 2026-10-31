import _Iterator from "@core-js/pure/actual/iterator/constructor";
// A prototype patch routes the constructor; the method belongs to that constructor.
_Iterator.prototype.map = patch;