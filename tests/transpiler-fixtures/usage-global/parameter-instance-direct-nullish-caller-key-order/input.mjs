// A possibly nullish IIFE receiver keeps the parameter's native null rejection.
// Later arguments finish before the throw; a computed pattern key remains unexecuted.
const events = [];
const receiver = JSON.parse('null');
export let result;
try {
  (({ [(events.push('key'), 'at')]: at }, other) => [at, other])(receiver, events.push('argument'));
} catch (error) {
  result = [error instanceof TypeError, events];
}
