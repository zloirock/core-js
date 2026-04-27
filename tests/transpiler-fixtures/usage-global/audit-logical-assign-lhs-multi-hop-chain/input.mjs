// `globalThis.self.Map ||= X` - multi-hop proxy-global chain on the LHS of a logical-assign.
// previously the warning fired only for direct `globalThis.Map` (Identifier object); chained
// `globalThis.self.Map` / `globalThis.window.Map` was MemberExpression-rooted and silently
// skipped. globalProxyMemberName walks the proxy-global chain and surfaces the warning
globalThis.self.Map ||= 1;
globalThis.window.Promise ??= 2;
