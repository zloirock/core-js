import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Two computed constructor slots keep their source order and their independent statics.
const src = {
  O: Object,
  A: Array
};
let gate = 1;
let se = 0;
let keys, from, dotted;
({
  [(se += 1, 'O')]: {
    keys: dotted
  },
  [(se += 1, 'A')]: {
    from
  }
} = gate && src);
export { keys, from, dotted, se };