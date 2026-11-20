// A bodyless declaration evaluates the first default before reading flat.
if (flag) var [first = fallback(), { flat }, last] = [source, receiver, tail];
consume(first, flat, last);
