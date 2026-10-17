// channel: deep param-annotation reference (a union wrapper), arg present but opaque
function fromUnionParam<T = string>(x: T | null): T { return x as any; }
fromUnionParam(new Date()).includes(1);
