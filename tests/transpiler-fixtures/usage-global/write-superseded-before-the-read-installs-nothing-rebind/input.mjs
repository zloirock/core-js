let rebound = null;
export function rebind() {
  rebound = Reflect;
  rebound = Object;
  return () => rebound.has({}, 'x');
}
