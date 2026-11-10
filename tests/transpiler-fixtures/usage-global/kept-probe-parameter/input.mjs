// A parameter default keeps its store without repeatedly refreshing its children.
// A supplied argument still owns the parameter values.
let held;
export function read({ resolve } = (held = globalThis.window)?.self.Promise) {
  return [resolve, held];
}
