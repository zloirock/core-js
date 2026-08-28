// the receiver MEMO binds nothing the source named and is written once, so wherever it stands as a
// statement of its own it takes `const` - whatever the host declares. the host's own kind belongs to
// the declarators that carry the source's bindings, which keep it (a `var` one still hoists). the
// exception both legs share is an SE-KEY group, where the memo joins the host's declaration instead
// of standing apart and a joined declarator carries that host's kind
const out = [];
var { at, flat } = [1, 2];
out.push(typeof at, typeof flat);

var { at: at2, ...rest } = [3, 4];
out.push(typeof at2, 'at' in rest);
export { out };
