// Function-valued fields retain their declared value and Array writes; only Array includes is needed.
const box = { data: function () {} };
box.data = [10, 20];
export const result = box.data.includes("02");
