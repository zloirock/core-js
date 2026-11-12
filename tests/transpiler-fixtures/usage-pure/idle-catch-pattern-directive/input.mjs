// Restoring an unused relocation keeps this opt-out on the surviving catch head.
try { source(); } catch ({
  // core-js-disable-next-line
  at,
}) {
  use(at);
}
