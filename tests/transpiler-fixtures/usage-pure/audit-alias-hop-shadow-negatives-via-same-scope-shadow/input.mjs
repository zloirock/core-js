const sameRoot = Array;
export function viaSameScopeShadow() {
  const sameRoot = {};
  const sameLink = sameRoot;
  const { of } = sameLink;
  return of(1);
}
