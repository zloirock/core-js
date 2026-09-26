// Native array selection still runs when its static namespace is polyfilled.
// The following read uses the namespace available in the target realm.
const held = [globalThis];
const [{ Reflect: { ownKeys } }] = held;
use(ownKeys);
