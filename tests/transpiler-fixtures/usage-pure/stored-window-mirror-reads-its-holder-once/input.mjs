// The assignment mirror owns one store and keeps the read through that value.
let of;
({ Array: { of } } = (holder().value = globalThis.window).self);
export { of };
