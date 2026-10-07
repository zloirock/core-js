// An excluded module counts against the realm only where a target needs it: Chrome 122 carries `Iterator`
// natively, so the realm key still names the built-in and its default is dead text - no `Promise.try`
// module for it.
const { Iterator: { try: viaKey } = Promise } = globalThis;
export { viaKey };
