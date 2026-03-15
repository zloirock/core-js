function unwrap<T>(p: Promise<T>): T { return null as any; }
const p: Promise<string> = Promise.resolve('x');
unwrap(p).at(0).normalize();
