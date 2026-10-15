// A guarded realm element supplies sibling constructor branches and an opaque key.
// Pure support on this rare loop host stops at existing routes: Babel keeps of native,
// while unplugin extracts it (the sidecar). The opaque read and false-arm throw remain.
let enabled = true;
const key = String(Math.random() > 2);
for (const { Array: { of, [key]: extra }, Object: { keys } } of [enabled && globalThis]) {
  use(of, keys, extra);
}
