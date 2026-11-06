// A body declaration shadows the function expression name; calls use that local receiver.
export var f = function coord() { var coord = g(); coord.push(1); };
