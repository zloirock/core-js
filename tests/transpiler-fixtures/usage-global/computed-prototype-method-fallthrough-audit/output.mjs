import "core-js/modules/es.array.at";
// computed `Array['prototype']['at']` must resolve like the dotted form and
// inject only `es.array.at`
Array['prototype']['at'];