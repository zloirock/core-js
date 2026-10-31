let mk = () => ({}), m2;
mk = m2 = () => globalThis;
export const callee = mk().Array.of(1);
