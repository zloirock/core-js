import "core-js/modules/es.string.includes";
// Every write arm is non-callable, so the installed body remains scannable.
const flag = false;
class Box {
  static data() {}
}
Box.change = function () {
  this.data = flag ? '1020' : '10200';
};
Box.change();
export const result = Box.data.includes('02');