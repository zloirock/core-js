// A closed caller evaluates its yielded source before capturing the receiver.
// The suspension stays in the generator, and the instance read follows every argument.
const events = [];
function make(value) { events.push(value); return 'ab'; }
function * run() {
  return (({ at }, other) => [at.call('ab', -1), other])(
    make(yield 'pause'), events.push('argument')
  );
}
const iterator = run();
const first = iterator.next();
export const r = [first, iterator.next('resume'), events];
