// A retained default keeps its native binding position before a sibling extraction.
const [first = fallback(), { flat }, last] = [source, receiver, tail], extra = 2;
consume(first, flat, last, extra);
