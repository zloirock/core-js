// A literal default applies only when the actual receiver's method is undefined.
export function read({ at = null }) {
  return at;
}
