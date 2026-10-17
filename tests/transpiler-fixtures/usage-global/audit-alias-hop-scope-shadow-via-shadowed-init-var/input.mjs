const raceRoot = Promise;
export function viaShadowedInitVar() {
  { const raceRoot = {}; var heldRace = raceRoot; }
  { const { race } = heldRace; return race([]); }
}
