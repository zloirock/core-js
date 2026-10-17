import "core-js/modules/es.object.values";
// a repositioned array container may hold any literal element at any slot - the destructure
// read unions the elements exactly like the member spelling does
const rd = [{
  n: 1
}, Object];
rd.reverse();
const {
  0: {
    values: viaReposition
  }
} = rd;
export { viaReposition };