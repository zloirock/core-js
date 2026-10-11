// an alias reads its source where it is declared, so a block-level function of the same name in a sloppy
// function the use stands in - hoisted to that function, not to the alias - does not shadow that read:
// the alias still holds the global
var B = Array;
function direct() { { function Array() {} } return B.from(xs); }
var P = Promise;
function closure() { { function Promise() {} } return function () { return P.resolve(1); }; }
use(direct, closure);
