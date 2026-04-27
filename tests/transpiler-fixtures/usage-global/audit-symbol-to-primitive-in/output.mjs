import "core-js/modules/es.symbol.to-primitive";
import "core-js/modules/es.date.to-primitive";
// `Symbol.X in obj` for non-iterator/asyncIterator well-knowns. Symbol.toPrimitive routes
// through the same in-expression polyfill path as Symbol.iterator/hasInstance: registers
// `es.symbol.to-primitive` plus `es.date.to-primitive` (Date inherits its toPrimitive method
// from a polyfill module). covers the well-known-symbol matrix beyond iterator/hasInstance
Symbol.toPrimitive in obj;