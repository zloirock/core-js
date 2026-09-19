import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// a tagged template IS an immediate invocation: the function body runs at the template, so the
// array write inside it lands at a straight-line position before the read, exactly as through a
// call - only the array family injects, and the call spelling beside it is the control
let x = 'ab';
(function () {
  x = [1, 2];
})`tpl`;
x.at(0);
let y = 'ab';
(function () {
  y = [1, 2];
})();
y.includes(1);