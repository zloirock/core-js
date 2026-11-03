// A literal loop binding is classified independently of its read position.
// Pure retains the native wrapper; global still sees the static.
for (const viaLater of [{
  w: Object
}]) {
  const z = 1;
  const {
    w: {
      keys: viaLaterKeys
    }
  } = viaLater;
  [z, viaLaterKeys];
}