// destructure-default static method seen at function param position emits side-effect
// imports regardless of the array-pattern wrap
function f([{ of } = Array]) {
  return of(1);
}
f([Array]);