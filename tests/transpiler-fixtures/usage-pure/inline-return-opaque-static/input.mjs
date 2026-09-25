// The loop keeps the call result opaque to static extraction, but its returns still name the
// candidates: pure guards the member read on Map, and global injects for the possible Map.
export const value = (() => {
  while (flag) return Map;
  return custom;
})().groupBy([1, 2, 3], value => value % 2);
