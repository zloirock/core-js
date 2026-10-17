// A closed caller evaluates its awaited source before capturing the receiver.
// The suspension stays in the async function, and the instance read follows every argument.
const events = [];
function make(value) { events.push(value); return 'ab'; }
async function run() {
  return (({ at }, other) => [at.call('ab', -1), other])(
    make(await Promise.resolve('resume')), events.push('argument')
  );
}
export const r = [await run(), events];
