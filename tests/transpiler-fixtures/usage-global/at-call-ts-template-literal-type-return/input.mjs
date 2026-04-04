function foo(): `${string}_suffix` {
  return 'hello_suffix';
}
foo().at(-1);
