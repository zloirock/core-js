// A write without a reader does not consume the previous slot value.
const cm = { s: Object };
cm.s = Array;
