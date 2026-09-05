// an undecided conditional type may take either branch at runtime; the fold strips the
// nullable branch for member dispatch but marks the survivor, so `??` on the call result
// must not collapse to an array-Maybe (the value may be null -> the string fallback)
declare function pick<T>(x: T): T extends string ? number[] : null;
(pick(g()) ?? 'fallback').at(0);
