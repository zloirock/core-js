// bigint and symbol are typeof-primitives too - an arg of those kinds must select its OWN overload, not
// fold to the declaration-first one. `m(123n)` (bigint) and `m(sym)` (symbol) pick the string[] overloads
// (Array.at / Array.includes), while the number arg keeps string (String.at). arg-match covers the full
// typeof-primitive set (string/number/boolean/bigint/symbol), not just string/number/boolean
interface P {
  m(x: number): string;
  m(x: bigint): string[];
  m(x: symbol): string[];
}
declare const p: P;
declare const sym: symbol;
p.m(123n).at(0);
p.m(7).at(0);
p.m(sym).includes('z');
