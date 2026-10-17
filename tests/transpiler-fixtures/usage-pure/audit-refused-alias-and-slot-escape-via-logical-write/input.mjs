const cl = { q: null };
cl.q ||= Promise;
export const viaLogicalWrite = typeof cl.q.try;
