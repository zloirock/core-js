import _Math$asinh from "@core-js/pure/actual/math/asinh";
import _Math$atanh from "@core-js/pure/actual/math/atanh";
import _Math$tanh from "@core-js/pure/actual/math/tanh";
// A literal keeps its native slots while an independently resolved call supplies its static.
// Native iteration, source effects and residual bindings stay in order.
const held = [Math];
for (const [{
  sinh: viaMixedAlias
}] of [held, [Math]]) use(viaMixedAlias(1));
const build = () => [Math];
for (const [{
  tanh: viaMixedCall
}] of [(build(), [{
  tanh: _Math$tanh
}]), [Math]]) use(viaMixedCall(1));
for (const [{
  acosh: viaMixedIife
}] of [[Math], (() => [Math])()]) use(viaMixedIife(1));
const wrapKeyed = value => [{
  k: value
}];
for (const [{
  k: {
    asinh: viaMixedParam
  }
}] of [(wrapKeyed(Math), [{
  k: {
    asinh: _Math$asinh
  }
}]), [{
  k: Math
}]]) use(viaMixedParam(1));
const builtHeld = build();
for (const [{
  atanh: viaMixedAliasOfCall
}] of [[{
  atanh: _Math$atanh
}], [Math]]) use(viaMixedAliasOfCall(0));