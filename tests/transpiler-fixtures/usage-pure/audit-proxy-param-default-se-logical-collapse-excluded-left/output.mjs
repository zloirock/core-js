import _Reflect$construct from "@core-js/pure/actual/reflect/construct";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
// Constructor rest uses the full index where a constructor entry exists (`Set`); other sources keep their
// rest exclusions and independently claimed statics. Behind the default's effect
// prefix a logical whose left the build does not serve (`.Reflect`, its namespace entry excluded, while
// `construct` keeps its own) keeps both operands, each polyfilled in place.
function effect() {}
function g({
  construct: _unused,
  ...rest
} = (effect(), _self.Reflect || _Set)) {
  let construct = _Reflect$construct;
  return construct(Base, []);
}
g();