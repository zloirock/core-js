interface Base { items: number[] }
interface Mixin { meta: string[] }
interface Box extends Base {}
interface Box extends Mixin {}
declare const b: Box;
b.items.at(-1);
