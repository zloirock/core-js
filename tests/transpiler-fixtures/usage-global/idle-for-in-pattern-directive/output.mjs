// Restoring the loop head keeps the property opt-out available to later passes.
for (const {
  // core-js-disable-next-line
  at
} in source) {
  use(at);
}