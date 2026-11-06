export function padByNested(fn, o) {
  return o.text?.padStart(o.items.flatMap(fn).length);
}
