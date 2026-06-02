// import-equals alias to a NESTED namespace (`import IM = M.Sub`, multi-segment moduleReference):
// the path-walker re-walks the alias target's segments to resolve the qualified `extends IM.Base`,
// so the inherited static return narrows `.at` to the array variant
namespace M { export namespace Sub { export class Base { static head<T>(): T[]; } } }
import IM = M.Sub;
class C extends IM.Base {}
C.head<string>().at(0);
