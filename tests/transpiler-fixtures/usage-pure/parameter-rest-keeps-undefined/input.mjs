// An unmirrorable rest parameter keeps missing leaves undefined, including on a default-only call.
export const out = (({ from, ...rest } = Array) => [from, rest])();
