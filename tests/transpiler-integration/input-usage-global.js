// These proposals don't exist natively — polyfills MUST be injected by the plugin
export const results = {
  clamp: 2.0.clamp(4, 6),
  setFrom: Set.from([1, 2, 3]).size,
  cooked: String.cooked`hello`,
};
