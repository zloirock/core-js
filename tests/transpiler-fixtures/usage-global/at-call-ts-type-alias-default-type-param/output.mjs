import "core-js/modules/es.string.at";
type Wrapper<T = string> = {
  value: T;
};
function foo(x: Wrapper) {
  x.value.at(0);
}