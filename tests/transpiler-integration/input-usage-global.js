// These proposals don't exist natively — polyfills MUST be injected by the plugin
export const results = {
  filterReject: [1, 2, 3, 4].filterReject(x => x % 2),
  uniqueBy: [1, 2, 3, 2, 1].uniqueBy(),
  setFrom: Set.from([1, 2, 3]).size,
  cooked: String.cooked`hello`,
};
