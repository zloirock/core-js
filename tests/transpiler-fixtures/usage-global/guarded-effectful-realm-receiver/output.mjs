import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
export function read(mark) {
  const s = globalThis.self;
  return [s?.[mark(), 'self'].value, s === globalThis, globalThis.self === globalThis];
}