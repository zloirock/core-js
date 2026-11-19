import _Map from "@core-js/pure/actual/map";
// A written spread keeps both values before the substituted constructor.
export const [first, second, {
  groupBy
}] = [...[1, 2], _Map];