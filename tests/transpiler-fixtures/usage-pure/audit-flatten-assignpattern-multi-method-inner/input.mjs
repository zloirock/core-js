// A default around a nested static pattern retains both independent method claims.
// The pristine Array receiver makes the object default unreachable.
const { Array: { from, of } = {} } = globalThis;
from('hi');
of(1, 2);
