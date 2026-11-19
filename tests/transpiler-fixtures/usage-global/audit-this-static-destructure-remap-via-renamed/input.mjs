class Renamed extends Map {
  static m() { const { groupBy: g } = this; return g; }
}
export const viaRenamed = Renamed.m();
