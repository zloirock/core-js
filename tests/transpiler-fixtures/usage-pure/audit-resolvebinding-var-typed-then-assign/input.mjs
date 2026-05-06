// resolveBindingType for var declared with annotation but no init: the binding then
// receives a runtime assignment in straight-line flow. findBindingAnnotation returns the
// declared annotation; ?.resolveTypeAnnotation locks the array kind. methods are distinct
// to confirm each emit ties to its line via the same source binding
var arr: string[];
arr = ['x', 'y', 'z'];
arr.findLast(s => s);
arr.at(0);
arr.includes('y');
