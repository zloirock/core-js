// Bodyless `else` host with sibling - distinct host shape from earlier if / while
// fixtures. confirms WRAP_BODYLESS_SE block lift is host-agnostic for the else
// branch slot (which only accepts a single statement, same as bodyless if/while).
// `Array.of` polyfill source distinct from prior fixtures pins emission to this case.
if (cond) noop(); else var { of } = (logEvent(), Array), n = 0;
export { of, n };
