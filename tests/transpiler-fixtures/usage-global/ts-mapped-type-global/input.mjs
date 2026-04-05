type Mapped = { [K in keyof Map<string, number> as K extends string ? K : never]: any };
const x: Mapped = {} as any;
x;
