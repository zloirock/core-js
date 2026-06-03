// the guarding branch is a TRY block (a throw before the assignment can skip it). `finally` always
// runs so it guards nothing; the use sits after the try-statement, so usage-pure bails
function f() {
  try { var M = globalThis; } finally {}
  M.Promise.allSettled([]);
}
