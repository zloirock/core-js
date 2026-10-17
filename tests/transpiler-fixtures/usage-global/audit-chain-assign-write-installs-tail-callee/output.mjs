import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
let mk = () => ({}),
  m2;
mk = m2 = () => globalThis;
export const callee = mk().Array.of(1);