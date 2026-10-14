// A stored selection between the realm and the user's object reached through the realm's proxies - a `self`
// or a `window` arm, a `self` hop in the pattern - holds the constructor on its realm arm alone: the nested
// static reads the captured hop through the identity guard, the proxy hops staying as written.
let held, from, of, fromEntries;
({ Array: { from } } = held = c ? self : shim);
({ self: { Array: { of } } } = held = c ? globalThis : shim);
({ Object: { fromEntries } } = held = c ? window : shim);
export { held, from, of, fromEntries };
