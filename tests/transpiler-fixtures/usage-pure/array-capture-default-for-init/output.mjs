// A for initializer preserves defaults and declarations without an invalid assignment target.
for (const [first = fallback(), {
  flat
}, last] = [source, receiver, tail]; flag;) consume(first, flat, last);