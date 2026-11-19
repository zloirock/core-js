// The caller's constructor needs its namespace for the parameter's native body read.
(({ Promise }) => Promise.resolve(1))(globalThis);
