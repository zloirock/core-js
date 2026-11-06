// an untouched static slot still narrows
class StaticIntact {
  static kept() { return [7, 8]; }
  static read() { return StaticIntact.kept().includes(7); }
}
export const values = [StaticIntact.read()];
