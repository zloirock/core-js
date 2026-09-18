// An escaping assignment follows its lexical binding and retains Map statics.
// A same-name write in a sibling function must not retain Promise.all or Promise.any.
function expose() { var a = {}; a = Map; hand(a); }
function sibling() { var a = {}; a = Promise; void a.name; }
