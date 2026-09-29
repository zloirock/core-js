import "core-js/modules/es.string.includes";
// Enumerated writes preserve Function/String alternatives; only String includes is needed.
const box = {
  data() {}
};
const alias = flag ? {} : box;
alias.data = "1020";
export const result = box.data.includes("02");