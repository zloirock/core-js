// Function-valued fields retain their declared value and Array writes; only Array includes is needed.
class Box { static data = function () {}; }
Box.data = [10, 20];
export const result = Box.data.includes("02");
