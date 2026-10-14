// Native array selection still runs when its static namespace is polyfilled.
// The hop is anchored on the namespace's ponyfill, where reading the static observes
// nothing, so the static's own import is all the claim leaves.
const held = [globalThis];
const [{ Reflect: { ownKeys } }] = held;
use(ownKeys);
