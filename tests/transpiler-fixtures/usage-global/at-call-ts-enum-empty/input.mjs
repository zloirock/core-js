enum Empty {}
declare const val: Empty;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
val.at(0);
