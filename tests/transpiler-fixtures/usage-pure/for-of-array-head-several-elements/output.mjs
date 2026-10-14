import _Math$acosh from "@core-js/pure/actual/math/acosh";
import _Math$asinh from "@core-js/pure/actual/math/asinh";
import _Math$atanh from "@core-js/pure/actual/math/atanh";
import _Math$sinh from "@core-js/pure/actual/math/sinh";
import _Math$tanh from "@core-js/pure/actual/math/tanh";
// A head over SEVERAL elements mirrors each of its own, one static per row: a bound container, a call, an
// IIFE, a parameter-filled slot under a nested level and a name bound to a call.
const held = [Math];
for (const [{
  sinh: viaMixedAlias
}] of [[{
  sinh: _Math$sinh
}], [{
  sinh: _Math$sinh
}]]) use(viaMixedAlias(1));
const build = () => [Math];
for (const [{
  tanh: viaMixedCall
}] of [(build(), [{
  tanh: _Math$tanh
}]), [{
  tanh: _Math$tanh
}]]) use(viaMixedCall(1));
for (const [{
  acosh: viaMixedIife
}] of [[{
  acosh: _Math$acosh
}], (() => [{
  acosh: _Math$acosh
}])()]) use(viaMixedIife(1));
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
  k: {
    asinh: _Math$asinh
  }
}]]) use(viaMixedParam(1));
const builtHeld = build();
for (const [{
  atanh: viaMixedAliasOfCall
}] of [[{
  atanh: _Math$atanh
}], [{
  atanh: _Math$atanh
}]]) use(viaMixedAliasOfCall(0));