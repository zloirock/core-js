import "core-js/modules/es.array.at";
function f(): string[] {
  return f();
}
f().at(0);