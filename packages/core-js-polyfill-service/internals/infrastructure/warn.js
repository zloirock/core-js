// the `warn` port: one message per condition, however much traffic passes through it. `script-tag`
// and the adapter run on every request, so an undeduplicated notice would be printed into every
// response and stop being readable exactly where it has to be read
export default function createWarn(sink) {
  const report = sink ?? defaultSink;
  const reported = new Set();

  return function warn(condition, message) {
    if (reported.has(condition)) return false;
    reported.add(condition);
    report(`[core-js] ${ message }`);
    return true;
  };
}

function defaultSink(message) {
  // eslint-disable-next-line no-console -- the default destination of developer-facing warnings
  console.warn(message);
}
