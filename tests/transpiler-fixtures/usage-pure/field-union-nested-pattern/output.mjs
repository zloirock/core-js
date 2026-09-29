import _includes from "@core-js/pure/actual/instance/includes";
// Nested extraction reads the same field union as direct member access.
// Pure keeps generic dispatch; the precise family set is observed by the global twin.
const box = {
  data: [10, 20]
};
box.data = "1020";
const includes = _includes(box.data);
export const result = includes.call("1020", "02");