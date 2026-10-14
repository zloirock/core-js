import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.math.acosh";
import "core-js/modules/es.math.asinh";
import "core-js/modules/es.math.atanh";
import "core-js/modules/es.math.sinh";
import "core-js/modules/es.math.tanh";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A head over SEVERAL elements mirrors each of its own, one static per row: a bound container, a call, an
// IIFE, a parameter-filled slot under a nested level and a name bound to a call.
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