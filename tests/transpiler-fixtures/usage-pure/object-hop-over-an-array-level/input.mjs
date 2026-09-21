// Object hops pair by property key and array levels pair by position.
// Calls and tagged calls keep their effects once while each static receives its pure value.
const log = [];
const mk = () => { log.push('mk'); return Array; };
function tag() { log.push('tag'); return Array; }
const { c: [{ of: viaCall, from: alsoViaCall }] } = { c: [mk()] };
const { c: [{ of: viaTag }] } = { c: [tag`x`] };
const { c: [{ from: viaBare }] } = { c: [Array] };
const { a: { c: [{ of: twoHops }] } } = { a: { c: [mk()] } };
export { viaCall, alsoViaCall, viaTag, viaBare, twoHops, log };
