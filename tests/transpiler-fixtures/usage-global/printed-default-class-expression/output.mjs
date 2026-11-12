import "core-js/modules/es.array.at";
// A named default class expression must not create a module binding.
export default (class Hidden {
  read() {
    return [7].at(0);
  }
});
console.log(typeof Hidden);