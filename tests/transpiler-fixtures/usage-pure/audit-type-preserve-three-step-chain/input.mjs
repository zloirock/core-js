// type preservation через 3 промежуточные binding'а: каждый шаг возвращает Array. финальный
// .at(-1) должен dispatch'ить _atMaybeArray (Array-narrowed), не generic _at
const a = Array.from([1]);
const b = a.concat([2]);
const c = b.slice(0);
c.at(-1);
