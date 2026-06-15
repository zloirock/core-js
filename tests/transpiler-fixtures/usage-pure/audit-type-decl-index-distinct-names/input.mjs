// type-alias declarations resolve through a per-statement-list name -> decl index (built once,
// O(1) lookups - avoids the O(N^2) per-name statement walk). each distinct alias name must map to
// its OWN declaration, not collapse to a shared one: distinct element types + methods prove the
// index keys names independently.
type Arr = number[];
type Str = string;
function useArr(a: Arr) { return a.at(0); }
function useStr(s: Str) { return s.at(0); }
function useArr2(b: Arr) { return b.includes(1); }
