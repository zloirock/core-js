// `declare const Map` is ambient - tsc elides it at runtime and references resolve to the
// global. a raw scope lookup would see the declare-binding as a shadow and skip the slot
// recording; the adapter filters ambient shapes, correctly reports `Map` as unshadowed, and
// the bare guard-shim write records the slot mutation - the name DEOPTS: the statement and
// the later read stay verbatim (native-faithful), and the debug note surfaces the deopt
declare const Map: any;
Map ||= {
  B: 2
};
console.log(Map);