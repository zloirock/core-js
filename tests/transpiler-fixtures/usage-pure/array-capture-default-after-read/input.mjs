// A later default must observe the earlier binding, never run in a preceding capture.
const [{ flat }, last = fallback(flat)] = [receiver, source];
consume(flat, last);
