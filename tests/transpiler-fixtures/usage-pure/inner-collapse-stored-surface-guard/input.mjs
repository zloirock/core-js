// A stored realm surface still performs its following window probe.
// Closed-over alias reads must not turn that probe into an always-defined value.
const log = [];
export const result = (() => {
  let inner, stored;
  const holder = { set value(value) { log.push('set'); stored = value; } };
  const value = (log.push('before'), holder.value = (log.push('between'),
    inner = (log.push('inside'), globalThis.self))).window?.Array.from((log.push('argument'), [7]));
  return [value, inner === globalThis, stored === globalThis];
})();
export const effects = log;
