// Nested array and element defaults keep native hasOwn reads at their original levels.
{
  function g({
    w: [{
      hasOwn
    } = {}] = []
  } = {
    w: [Object]
  }) {
    return hasOwn;
  }
}