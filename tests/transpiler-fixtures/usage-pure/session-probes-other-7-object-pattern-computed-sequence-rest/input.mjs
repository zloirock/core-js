// Computed keys run in source order beside native object rest.
// The instance leaf keeps its dispatch; the static leaf under a literal
// object wrapper retains its native read and key effect.
function eff() { return Object; }
{
const { q: qq, p: { [(eff.push('key'), 'flat')]: m2, other2 } } = { q: (eff.push('se'), 1), p: holder.p }; use(qq, m2, other2);
}
{
const { w: { [(eff('k2'), 'from')]: f }, ...r } = { w: Array };
}
