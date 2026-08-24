// a SPREAD ahead of the consumed element makes the pairing runtime-uncertain: the slot may
// hold any of the spread's own items, so a substituted binding would compute the wrong
// value - the claim DECLINES whole and the destructure stays native (babel's verdict)
const [, {
  at: m
}] = [...xs, arr];
use(m);