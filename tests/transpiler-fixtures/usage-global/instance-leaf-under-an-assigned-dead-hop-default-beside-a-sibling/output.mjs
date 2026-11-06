import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// An assigned literal supplies the live nested instance receiver beside an outer sibling.
// The live Array slot supplies the imports; the dead hop default never runs.
let fl, zw;
const holder = {
  list: [1, 2]
};
({
  w: {
    y: {
      flat: fl
    }
  } = {
    y: [1]
  },
  zw
} = {
  w: {
    y: holder.list
  },
  zw: 1
});