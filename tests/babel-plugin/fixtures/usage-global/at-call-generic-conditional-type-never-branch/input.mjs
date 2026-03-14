function nonNull<T>(x: T): T extends null | undefined ? never : T { return x as any; }
nonNull('hello').at(0);
