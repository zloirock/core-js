// control: when the function explicitly returns an OBJECT, `new f()` evaluates to that object
// (the construct keeps an object return), so the array return narrows the instance and `.at`
// resolves to the array-instance polyfill
function f() {
  return [1, 2];
}
(new f()).at(0);
