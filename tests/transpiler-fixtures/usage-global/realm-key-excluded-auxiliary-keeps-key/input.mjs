// Excluding a module that only rides along with a global's entry (`es.iterator.drop` beside the defining
// `es.iterator.constructor`) leaves the global carried: the realm key still names the built-in and its
// default is dead text - no `Promise.try` module for it.
const { Iterator: { try: viaKey } = Promise } = globalThis;
export { viaKey };
