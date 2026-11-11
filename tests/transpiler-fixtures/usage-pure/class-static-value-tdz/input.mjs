// Extracting an inherited method still reads the class binding.
// Before the declaration that read must throw ReferenceError.
const effects = [];
export const result = (() => {
try { const f = Bag.from; class Bag extends Array {} return 0; } catch (error) { return error.name; }
})();
