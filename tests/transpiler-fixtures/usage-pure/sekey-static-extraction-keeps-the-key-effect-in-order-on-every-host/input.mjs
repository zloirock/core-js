// an effectful computed key over a static claim runs where the source ran it on every host - an export, a
// declarator list behind a leading sibling, a default, a rest, a second key, a for, if or while head: the
// receiver's prefix runs first, then the key, then the sibling reads. a constructor exported through such a key
// takes its whole entry
let k = 0;
function pre() {}
function eff() {}
export const first = 1, { [(k++, 'from')]: f, m } = Array;
export const lead = pre(), { [(k++, 'of')]: ko, alsoMore } = (eff(), Array);
var lead2 = pre(), { [(k++, 'of')]: ko2 = 1, m2 } = Array;
var lead3 = pre(), { [(k++, 'Map')]: P, m3 } = (eff(), globalThis);
var lead4 = pre(), { [(k++, 'of')]: ko4, ...r4 } = Array;
var lead5 = pre(), { [(k++, 'of')]: ko5, [(k++, 'from')]: fr5, m5 } = Array;
for (var lead6 = pre(), { [(k++, 'of')]: ko6, m6 } = (eff(), Array); false;) break;
if (k) var lead7 = pre(), { [(k++, 'of')]: ko7, m7 } = (eff(), Array);
while (k < 0) var lead8 = pre(), { [(k++, 'of')]: ko8, m8 } = Array;
export default [ko2, m2, P, m3, ko4, r4, ko5, fr5, m5, ko6, m6, ko7, m7, ko8, m8, lead2, lead3, lead4, lead5, lead6, lead7, lead8, k];
