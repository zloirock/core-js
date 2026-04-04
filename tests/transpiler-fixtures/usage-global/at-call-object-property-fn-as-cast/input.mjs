const obj = {
  fn: (() => 'hello') as () => string
};
obj.fn().at(0);
