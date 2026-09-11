import "core-js/modules/es.string.at";
type Str = string & {};
const x: Str = "hello";
x.at(0);