import "core-js/modules/es.string.at";
const obj = {
  fn: (() => 'hello') as () => string
};
obj.fn().at(0);