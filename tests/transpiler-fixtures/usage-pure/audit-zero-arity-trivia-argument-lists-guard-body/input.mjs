const o = { m: () => [[1]] };
export const guardBody = o.m?.(/* none */).flat();
