// A callable initializer does not prove that later slot values remain functions.
const box = { data() {} };
box.data = [10, 20];
export const result = box.data.includes("02");
