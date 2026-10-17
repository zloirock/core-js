// Excluding a module of a global's entry (`es.iterator.drop`) leaves the global carried: the realm key
// still names the built-in, so its default is dead text and no usage - neither `Promise.try` nor the
// `Promise` the default names loads.
const { Iterator: { try: viaKey } = Promise } = globalThis;
export { viaKey };
