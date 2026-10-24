const log = [];
export const result = (({ of, length }) => [of(3), length])(
  (() => (log.push([7].at(0)), Array))() || Set,
);
export { log };
