import "core-js/modules/es.string.at";
const obj = {
  fn: (() => 'hello') satisfies () => string
};
obj.fn().at(0);