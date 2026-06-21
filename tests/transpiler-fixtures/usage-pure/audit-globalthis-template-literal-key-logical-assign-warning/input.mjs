// single-quasi TemplateLiteral computed key on proxy-global LHS - the cooked-string form
// resolves to the global name, so the gate fires and the warning uses bracket notation
globalThis[`Promise`] ||= {};
