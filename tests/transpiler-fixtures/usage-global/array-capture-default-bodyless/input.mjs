// A bodyless declaration keeps its retained default as a native binding.
if (flag) var [first = fallback(), { flat }, last] = [source, receiver, tail];
consume(first, flat, last);
