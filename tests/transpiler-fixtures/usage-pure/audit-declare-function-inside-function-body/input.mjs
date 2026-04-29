// `declare function` inside function body: ambient binding в nested scope. ambient walk
// должен drill через function-body BlockStatement до statement array. Без этого `g().at(0)`
// fall'ит к generic вместо array-narrowed (return type number[] аннотация теряется)
function f() {
  declare function g(): number[];
  return g().at(0);
}
