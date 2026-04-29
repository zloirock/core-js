// `globalThis.self.Map ||= X` - multi-hop proxy-global chain on the LHS of a logical-assign.
// proxy-global walking surfaces the warning along the whole chain so member-rooted writes
// like `globalThis.self.Map` / `globalThis.window.Map` reach the same diagnostic as
// the direct `globalThis.Map` (identifier object) form
globalThis.self.Map ||= 1;
globalThis.window.Promise ??= 2;
