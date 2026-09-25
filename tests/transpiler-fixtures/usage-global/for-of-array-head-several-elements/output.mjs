import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.math.acosh";
import "core-js/modules/es.math.asinh";
import "core-js/modules/es.math.atanh";
import "core-js/modules/es.math.clz32";
import "core-js/modules/es.math.cosh";
import "core-js/modules/es.math.imul";
import "core-js/modules/es.math.sinh";
import "core-js/modules/es.math.tanh";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a call element beside a BOUND sibling runs once into a memo the sibling reads off, while a REST
// beside the claim keeps the level to the routes that carry a rest (the head takes the slot's own
// default); a head over SEVERAL elements mirrors each of its own - a bound container, a call, an IIFE,
// a parameter-filled slot under a nested level, a name bound to a call. one static per row
const pairing = () => [Math, 1];
for (const [{
  clz32: viaCallSibling
}, next] of [pairing()]) use(viaCallSibling(1), next);
for (const [{
  imul: viaCallRest
}, ...afterCall] of [pairing()]) use(viaCallRest(2, 3), afterCall);
const pair = [Math, 1];
for (const [{
  cosh: viaAliasRest
}, ...afterAlias] of [pair]) use(viaAliasRest(1), afterAlias);
const held = [Math];
for (const [{
  sinh: viaMixedAlias
}] of [held, [Math]]) use(viaMixedAlias(1));
const build = () => [Math];
for (const [{
  tanh: viaMixedCall
}] of [build(), [Math]]) use(viaMixedCall(1));
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
}] of [wrapKeyed(Math), [{
  k: Math
}]]) use(viaMixedParam(1));
const builtHeld = build();
for (const [{
  atanh: viaMixedAliasOfCall
}] of [builtHeld, [Math]]) use(viaMixedAliasOfCall(0));