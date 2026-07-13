// single-quasi TemplateLiteral computed key on the proxy-global LHS - the cooked string
// resolves to the global name, so the slot records like the dotted form
globalThis[`Promise`] ||= {};
