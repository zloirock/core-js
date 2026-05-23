// single-quasi TemplateLiteral computed key on proxy-global LHS - `memberKeyName`
// recognises the cooked-string form, gate fires with bracket notation
globalThis[`Promise`] ||= {};
