// A callable initializer does not prove that later slot values remain functions.
class Box { static data() {} }
Box.data = [10, 20];
export const result = Box.data.includes("02");
