// several computed keys over a proven receiver no read takes owe it only what discarding it runs, ahead
// of the first key, once every key is served by name: a reused constructor keeps no coercion, and a
// captured call no binding
// usage-global rewrites nothing: the Promise read loads its constructor modules, each claimed static its own
// (`allSettled` with resolve and iteration, `from` with string iteration), `log.push` its own
export const log = [];
export const { [(log.push('k1'), 'try')]: attempt, [(log.push('k2'), 'allSettled')]: settle } = (log.push('i1'), Promise);
function make() { log.push('i2'); return Array; }
export const { [(log.push('k3'), 'of')]: of, [(log.push('k4'), 'from')]: from } = make();
