import _Map from "@core-js/pure/actual/map";
// Expanding a spread keeps the following constructor after both values.
export const [first, second, {
  groupBy
}] = [1, 2, _Map];