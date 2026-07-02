// declare function getArr(): string[]; const f = getArr; const g = f; g().at(0)
// the ambient-function retry must walk the FULL alias chain `g` -> `f` -> `getArr` to land
// on the ambient declaration's return annotation. single-hop logic would stop at `f` (no
// ambient for `f`) and fall through to generic `_at`
declare function getArr(): string[];
const f = getArr;
const g = f;
g().at(0);
