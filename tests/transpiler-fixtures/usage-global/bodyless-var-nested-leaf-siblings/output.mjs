import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.iterator";
// an unbraced `var` whose nested leaf flattens keeps every other declarator of that `var`: the
// flattened pair joins the declarator list in place, beside a sibling another route rewrote first,
// and each of two flattened declarators reads its own memo
const box = {
  y: [1, [2]]
};
if (box) var q = 1,
  {
    y: {
      at: afterSibling,
      flat: afterSiblingFlat
    }
  } = box;
if (box) var {
    from: staticFirst
  } = Array,
  {
    y: {
      at: afterStatic,
      flat: afterStaticFlat
    }
  } = box;
if (box) var {
    y: {
      at: one,
      flat: oneFlat
    }
  } = box,
  {
    y: {
      at: two,
      flat: twoFlat
    }
  } = box;
export { q, afterSibling, afterSiblingFlat, staticFirst, afterStatic, afterStaticFlat, one, oneFlat, two, twoFlat };