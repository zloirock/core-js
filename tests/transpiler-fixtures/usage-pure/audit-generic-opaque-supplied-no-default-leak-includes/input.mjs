// channel: deep param-annotation reference (a union wrapper), arg present but opaque
function fromUnionParam<T = string>(x: T | null): T { return x as any; }
// @ts-expect-error the member read is the probe, and the right answer is a type without it
fromUnionParam(new Date()).includes(1);
