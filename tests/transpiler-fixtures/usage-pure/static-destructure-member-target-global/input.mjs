// Writing a global static must keep the original assignment and its property semantics.
({ from: globalThis.Array.from } = Array);
