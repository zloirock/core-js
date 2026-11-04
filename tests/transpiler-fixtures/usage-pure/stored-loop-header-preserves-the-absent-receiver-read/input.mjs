// The loop initializer observes the store once, then reads through its value.
let held;
for (const { of } = (held = (prefix(), globalThis.window)).Array;;) { use(of); break; }
export { held };
