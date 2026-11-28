namespace NS4 { export class Cls extends Array<number> {} }
type I4 = InstanceType<typeof NS4.Cls>;
declare const i4: I4;
i4.includes(1);
