// A guarded realm element supplies sibling constructor branches and an opaque key.
// Global usage injects the potentially needed statics without rewriting the pattern.
let enabled = true;
const key = String(Math.random() > 2);
for (const { Array: { of, [key]: extra }, Object: { keys } } of [enabled && globalThis]) {
  use(of, keys, extra);
}
