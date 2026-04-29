import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `T['k']` indexed access на generic параметр с object-literal arg обёрнутым TS-cast.
// Резолвер должен peel'ить wrapper до ObjectExpression. Без peel oxc-парсер сохраняет
// TSAsExpression и резолв падает к constraint fallback (precision loss vs babel)
function pick<T extends { k: unknown }>(o: T): T['k'] {
  return o.k as T['k'];
}
const result = pick({ k: [1, 2] } as { k: number[] });
_atMaybeArray(result).call(result, -1);