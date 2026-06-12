// re-verified narrowing positives: each line locks a shape once suspected to under-resolve
// a parenthesized mapped-type constraint and body peel to the inner type
interface Foo { xs: number[] }
type M = { [K in keyof (Foo)]: (Foo)[K] };
declare const m: M;
m.xs.at(0);
// a computed STRING-literal class-field key names a fixed slot - the field type applies
class C { ['ys']: number[] = [1]; m() { return this['ys'].flat(); } }
new C().m();
// a direct new-expression receiver peels to the class for method return narrowing
class D { zs(): number[] { return [1]; } }
new D().zs().includes(1);
// intersections narrow from the primitive branch and the container branch alike
type BrandedS = string & { __b?: true };
declare const bs: BrandedS;
bs.padStart(2);
type BrandedA = number[] & { __b?: true };
declare const ba: BrandedA;
ba.flatMap(x => [x]);
// compound string concatenation narrows through the shared operator table
let cs = 'a';
cs += 'b';
cs.trimEnd();
// a heterogeneous enum stays opaque as a WHOLE type, but each member keeps its own kind
enum H { A, B = 'x' }
H.B.repeat(2);
