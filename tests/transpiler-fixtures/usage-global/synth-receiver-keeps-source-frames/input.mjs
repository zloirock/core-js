// A later parameter shadows the default constructor. An opaque supplied receiver
// must not make the default read the global constructor.
(({ from } = Array, Array) => from([1, 2]))(other);
