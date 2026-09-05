// a store standing ABOVE the navigation is not a store OF it: the member between hands on its own
// value, so the read through the nav keeps its probe guard (`out = nav.Promise[key]` writes the
// read, not the nav). the unreadable key leaves the ctor injected and its members unsubstituted, so
// every row lands on that one binding. a KEPT nav pins the boundary: there the write really does
// hold the navigation, and the stored canon spells what the source stores
const alias = globalThis;
let out, key, kept;
out = delete globalThis.window?.self?.Promise[key];
out = globalThis.window?.self?.Promise[key];
out = alias.window?.self?.Promise[key];
kept = globalThis.window?.self;
export { out, kept };
