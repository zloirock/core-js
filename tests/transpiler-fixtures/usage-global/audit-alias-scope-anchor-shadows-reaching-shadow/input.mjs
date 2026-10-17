// a dead-init reaching value (unconditional overwrite before a closure read) resolves in the
// binding's scope too
let reaching = Object;
reaching = Map;
export function reachingShadow(Map) {
  return () => reaching.groupBy([4], v => v);
}
