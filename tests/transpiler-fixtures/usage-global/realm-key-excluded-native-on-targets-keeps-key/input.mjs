// An excluded module never counts against the realm, whatever the targets: with Chrome 122 carrying
// `Iterator` natively, as on a target lacking it, the realm key still names the built-in and its default
// is dead text - no `Promise.try` module for it.
const { Iterator: { try: viaKey } = Promise } = globalThis;
export { viaKey };
