export function staticMember(flag) {
  if (flag) { var realm = globalThis; }
  return realm?.Map.groupBy;
}
