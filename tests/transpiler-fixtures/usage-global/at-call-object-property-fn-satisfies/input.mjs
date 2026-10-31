const obj = {
  fn: (() => 'hello') satisfies () => string
};
obj.fn().at(0);
