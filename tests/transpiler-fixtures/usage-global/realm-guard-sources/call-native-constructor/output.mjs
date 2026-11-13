import "core-js/modules/es.promise.with-resolvers";
// The target-native Promise is not another source of undefined.
// Keep the call result as the environment probe and serve its newer static.
function get() {
  return globalThis.window;
}
export const result = typeof get()?.Promise?.withResolvers;