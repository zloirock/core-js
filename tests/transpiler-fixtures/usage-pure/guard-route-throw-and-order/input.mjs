export function read(arg) {
  const alias = globalThis.window;
  const key = 'Array';
  let held;
  return [(held = globalThis.window?.self)[key].from(arg()), alias.self?.Array.from(arg()), held];
}
