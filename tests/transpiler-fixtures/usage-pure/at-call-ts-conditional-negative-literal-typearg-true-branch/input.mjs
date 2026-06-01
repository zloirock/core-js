// negative-literal type argument to a conditional-type alias (`C<-1>` where
// `C<X> = X extends -1 ? number[] : string`): the signed literal is compared by value, so
// `-1 extends -1` holds and the true branch (number[]) selects the array-specific at variant
type C<X> = X extends -1 ? number[] : string;
declare const v: C<-1>;
const r = v.at(0);
export { r };
