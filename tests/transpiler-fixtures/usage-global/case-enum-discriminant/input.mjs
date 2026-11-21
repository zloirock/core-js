export function read() {
  switch (typeof Map.groupBy) {
    case 'function': enum Map { None = 0 } return Map.None;
    default: return -1;
  }
}
