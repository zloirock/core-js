// `.entries()` на Array возвращает Iterator. финальный .next() vs .filter() должен
// видеть Iterator type через type-preservation после assign-rewrite. полифил .filter
// на Iterator dispatch'ит iterator-specific helper (не array)
const arr = Array.from([1, 2]);
const iter = arr.entries();
iter.filter(([, v]) => v > 0).toArray();
