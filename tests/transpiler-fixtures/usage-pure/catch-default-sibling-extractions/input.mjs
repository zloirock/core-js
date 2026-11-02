// A relocated catch default and a nested read keep their own bindings.
// The temporary default guard belongs to the joined extraction declaration.
try { throw getPlugin(); }
catch ({ name = 'anonymous', options: { filter } }) { use(name, filter); }
