import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
// A destructured carrier slot binds the object itself; writes through that alias remain visible.
const box = {
  data: [10, 20]
};
const {
  box: alias
} = {
  box
};
alias.data = "1020";
export const result = box.data.includes("02");