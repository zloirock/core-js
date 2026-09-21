// A captured assignment yields the original realm, while its static leaf receives a polyfill.
// A parameter default serves only its omitted-argument arm; discarded assignments may mirror the receiver.
let of, from;
const { Object: { fromEntries }, Math: { floor } } = globalThis, alias = ({ Array: { of } } = globalThis);
const { Reflect: { ownKeys } } = globalThis, mk = function ({ Map: { groupBy } } = globalThis) { return groupBy; };
({ Array: { from } } = globalThis);
export { of, from, fromEntries, floor, alias, mk };
