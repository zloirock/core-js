interface Processor<T = number> {
  process(): T;
}

function foo(x: Processor) {
  x.process().toFixed(2);
}
