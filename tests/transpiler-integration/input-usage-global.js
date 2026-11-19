// These proposals don't exist natively — polyfills MUST be injected by the plugin
export const results = {
  clamp: 2.0.clamp(4, 6),
  cooked: String.cooked`hello`,
};
