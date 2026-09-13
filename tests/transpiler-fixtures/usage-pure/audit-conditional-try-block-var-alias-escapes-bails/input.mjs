// A try block does not prove that its alias assignment ran. Test the stored realm's identity
// before selecting the ponyfill, and keep the original member read as the fallback.
function f() {
  try { var M = globalThis; } finally {}
  M.Promise.allSettled([]);
}
