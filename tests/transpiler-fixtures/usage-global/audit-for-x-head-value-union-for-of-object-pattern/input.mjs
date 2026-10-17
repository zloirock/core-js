let Q = Object;
for ({ q: Q } of [{ q: Promise }]) { break; }
