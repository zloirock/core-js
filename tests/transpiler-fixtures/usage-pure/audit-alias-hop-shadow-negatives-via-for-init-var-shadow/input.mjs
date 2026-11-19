const forRoot = Map;
export function viaForInitVarShadow() {
  { const forRoot = {}; for (var forHeld = forRoot; false;) break; }
  { const { groupBy } = forHeld; return groupBy([], v => v); }
}
