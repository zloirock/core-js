import "core-js/modules/es.function.name";
import "core-js/modules/es.string.at";
const obj = {
  greet() {
    return 'hello';
  }
};
const fn = obj.greet;
fn.name.at(0);