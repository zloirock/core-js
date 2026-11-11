// The class read can throw before the computed key runs.
export const effects = [];
export const result = (() => {
  try {
    Bag[(effects.push("key"), "from")]([]);
    class Bag extends Array {}
  } catch (error) { return error.name; }
})();
