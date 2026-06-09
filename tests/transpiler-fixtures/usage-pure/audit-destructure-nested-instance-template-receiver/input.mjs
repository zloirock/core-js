// a nested instance method off a CONSTANT (no-interpolation) template-literal receiver. a constant
// template is a string constant - re-referencing it yields the same string, hence the same method - so it
// polyfills like a StringLiteral receiver, extracting the binding while the key stays renamed in place. an
// INTERPOLATED `` `${x}` `` would bail (re-evaluating re-runs x's string coercion, a possible side effect)
const { y: { padStart: m } } = { y: `ab` };
