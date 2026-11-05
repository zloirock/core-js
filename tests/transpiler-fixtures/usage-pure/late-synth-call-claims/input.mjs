// Synthesizing a static argument must retain claims inside the call that supplies its receiver.
// The nested at call runs once before the of and length bindings initialize.
const log = [];
export const result = (({ of, length }) => [of(3), length])(
  (() => (log.push([7].at(0)), Array))() || Set,
);
export { log };
