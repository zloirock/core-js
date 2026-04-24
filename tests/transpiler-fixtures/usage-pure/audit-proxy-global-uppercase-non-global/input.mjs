// capitalised destructure from globalThis that isn't a known global - no polyfill emitted
const { UserClass } = globalThis;
UserClass?.prototype?.method?.();
