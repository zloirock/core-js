// resolveBindingType: function param with default ([]) - AssignmentPattern wraps the
// Identifier param. findBindingAnnotation peels through `node.left?.typeAnnotation` for
// the AssignmentPattern shape. typeof guards on the binding never apply (binding is
// declared with explicit annotation `string[]`), so direct type-annotation branch wins.
// distinct methods so each line maps to its instance call
function step(items: string[] = []) {
  items.findLast(s => s);
  items.at(0);
  items.includes('z');
}
step(['a', 'b']);
