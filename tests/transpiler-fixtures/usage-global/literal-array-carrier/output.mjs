import "core-js/modules/es.array.at";
// A local array slot keeps the held literal closed while its uses only read fields.
const box = {
  data: [1, 2]
};
const wrap = [box];
wrap[0].data.length;
export const {
  at
} = box.data;