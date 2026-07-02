// `type Q = typeof ref` aliases a `typeof` query to a class binding; `declare const m: Q` indirects through it.
// Static-method return types must resolve through the alias to emit precise Array vs String polyfills.
class Mod {
  static fetchOne(): string[] { return []; }
  static fetchTwo(): string { return ''; }
}
const ref = Mod;
type Q = typeof ref;
declare const m: Q;
m.fetchOne().findLast(s => s);
m.fetchOne().at(0);
m.fetchTwo().includes('z');
