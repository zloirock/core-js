export function escapeWithNoGuard(mk) {
  mk(Promise);
  return new Promise(r => r(1));
}
