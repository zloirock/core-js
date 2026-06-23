// A getter exposed on a class through a MERGED interface declaration resolves, on property access, to
// its RETURN type - not a Function value. reading the getter as a Function would drop the polyfill for
// the real array / string it yields (ie:11 has no native `.at` / `.includes` -> throw). a paired setter
// is write-only and skips to the getter; a plain method stays a Function on access (only a call resolves
// its return). distinct methods keep each resolution identifiable.
class C {
  foo() {}
}
interface C {
  get items(): number[];
  set items(v: number[]);
  get label(): string;
}
const c = new C();
export const a = c.items.at(0);
export const b = c.label.includes("x");
