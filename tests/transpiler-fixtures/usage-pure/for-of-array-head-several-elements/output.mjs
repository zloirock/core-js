import _Math$acosh from "@core-js/pure/actual/math/acosh";
import _Math$asinh from "@core-js/pure/actual/math/asinh";
import _Math$atanh from "@core-js/pure/actual/math/atanh";
import _Math$clz32 from "@core-js/pure/actual/math/clz32";
import _Math$cosh from "@core-js/pure/actual/math/cosh";
import _Math$imul from "@core-js/pure/actual/math/imul";
import _Math$sinh from "@core-js/pure/actual/math/sinh";
import _Math$tanh from "@core-js/pure/actual/math/tanh";
var _ref;
// a call element beside a BOUND sibling runs once into a memo the sibling reads off, while a REST
// beside the claim keeps the level to the routes that carry a rest (the head takes the slot's own
// default); a head over SEVERAL elements mirrors each of its own - a bound container, a call, an IIFE,
// a parameter-filled slot under a nested level, a name bound to a call. one static per row
const pairing = () => [Math, 1];
for (const [{
  clz32: viaCallSibling
}, next] of [(_ref = pairing(), [{
  clz32: _Math$clz32
}, _ref[1]])]) use(viaCallSibling(1), next);
for (const [{
  imul: viaCallRest = _Math$imul
}, ...afterCall] of [pairing()]) use(viaCallRest(2, 3), afterCall);
const pair = [Math, 1];
for (const [{
  cosh: viaAliasRest = _Math$cosh
}, ...afterAlias] of [pair]) use(viaAliasRest(1), afterAlias);
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