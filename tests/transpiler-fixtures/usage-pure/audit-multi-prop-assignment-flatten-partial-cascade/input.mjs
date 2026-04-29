// destructure assignment с одним полифилл-eligible и одним opaque outer prop. полифилл
// extracts; opaque prop сохраняется в residual destructure (с polyfilled receiver); host
// statement выживает потому что residual всё ещё имеет consumer
let from, x;
({ Array: { from }, custom: { x } } = globalThis);
