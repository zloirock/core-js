// use only with DOM lib

// Fallbacks for DOM types
interface Element {} // @type-options: no-export
interface Node {} // @type-options: no-export
interface HTMLOptionElement {} // @type-options: no-export

interface ArrayIterator<T> extends IteratorObject<T, BuiltinIteratorReturn, unknown> { // @type-options: no-export
  [Symbol.iterator](): ArrayIterator<T>;
}

interface DOMTokenList { // @type-options: no-export
  /**
   * Calls a defined callback function on each element of the DOMTokenList,
   * passing the element, its index, and the entire DOMTokenList as arguments.
   * @param callbackfn - The function to execute for each element.
   * @param thisArg - Value to use as this when executing `callbackfn`.
   */
  forEach(
    callbackfn: (value: Element, index: number, collection: DOMTokenList) => void,
    thisArg?: any
  ): void;

  /**
   * Returns an iterable of keys in the DOMTokenList.
   */
  keys(): IterableIterator<number>;

  /**
   * Returns an iterable of values in the DOMTokenList.
   */
  values(): IterableIterator<Element>;

  /**
   * Returns an iterable of key, value pairs in the DOMTokenList.
   */
  entries(): IterableIterator<[number, Element]>;

  [Symbol.iterator](): IterableIterator<Element>;
}

interface NodeList { // @type-options: no-export
  /**
   * Calls a defined callback function on each element of the NodeList,
   * passing the element, its index, and the entire NodeList as arguments.
   * @param callbackfn - The function to execute for each element.
   * @param thisArg - Value to use as this when executing `callbackfn`.
   */
  forEach(
    callbackfn: (value: Node, index: number, collection: NodeList) => void,
    thisArg?: any
  ): void;

  /**
   * Returns an iterable of keys in the NodeList.
   */
  keys(): IterableIterator<number>;

  /**
   * Returns an iterable of values in the NodeList.
   */
  values(): IterableIterator<Node>;

  /**
   * Returns an iterable of key, value pairs in the NodeList.
   */
  entries(): IterableIterator<[number, Node]>;

  /**
   * Returns an iterable of values in the NodeList.
   */
  [Symbol.iterator](): IterableIterator<Node>;
}

interface CSSRuleList { // @type-options: no-export
  /**
   * Returns an iterable of values in the CSSRuleList.
   */
  [Symbol.iterator](): IterableIterator<CSSRuleList>;
}

interface CSSStyleDeclaration { // @type-options: no-export
  /**
   * Returns an iterable of values in the CSSStyleDeclaration.
   */
  [Symbol.iterator](): IterableIterator<CSSStyleDeclaration>;
}

interface CSSValueList { // @type-options: no-export
  /**
   * Returns an iterable of values in the CSSValueList.
   */
  [Symbol.iterator](): IterableIterator<CSSValueList>;
}

interface ClientRectList { // @type-options: no-export
  /**
   * Returns an iterable of values in the ClientRectList.
   */
  [Symbol.iterator](): IterableIterator<ClientRectList>;
}

interface DOMRectList { // @type-options: no-export
  /**
   * Returns an iterable of values in the DOMRectList.
   */
  [Symbol.iterator](): IterableIterator<DOMRectList>;
}

interface DOMStringList { // @type-options: no-export
  /**
   * Returns an iterable of values in the DOMStringList.
   */
  [Symbol.iterator](): IterableIterator<DOMStringList>;
}

interface DataTransferItemList { // @type-options: no-export
  /**
   * Returns an iterable of values in the DataTransferItemList.
   */
  [Symbol.iterator](): IterableIterator<DataTransferItemList>;
}

interface FileList { // @type-options: no-export
  /**
   * Returns an iterable of values in the FileList.
   */
  [Symbol.iterator](): IterableIterator<FileList>;
}

interface HTMLAllCollection { // @type-options: no-export
  /**
   * Returns an iterable of values in the HTMLAllCollection.
   */
  [Symbol.iterator](): IterableIterator<HTMLAllCollection>;
}

interface HTMLCollection { // @type-options: no-export
  /**
   * Returns an iterable of values in the HTMLCollection.
   */
  [Symbol.iterator](): ArrayIterator<Element>;
}

interface HTMLFormElement { // @type-options: no-export
  /**
   * Returns an iterable of values in the HTMLFormElement.
   */
  [Symbol.iterator](): IterableIterator<Element>;
}

interface HTMLSelectElement { // @type-options: no-export
  /**
   * Returns an iterable of values in the HTMLSelectElement.
   */
  [Symbol.iterator](): IterableIterator<HTMLOptionElement>;
}

interface MediaList { // @type-options: no-export
  /**
   * Returns an iterable of values in the MediaList.
   */
  [Symbol.iterator](): IterableIterator<MediaList>;
}

interface MimeTypeArray { // @type-options: no-export
  /**
   * Returns an iterable of values in the MimeTypeArray.
   */
  [Symbol.iterator](): IterableIterator<MimeTypeArray>;
}

interface NamedNodeMap { // @type-options: no-export
  /**
   * Returns an iterable of values in the NamedNodeMap.
   */
  [Symbol.iterator](): IterableIterator<NamedNodeMap>;
}

interface PaintRequestList { // @type-options: no-export
  /**
   * Returns an iterable of values in the PaintRequestList.
   */
  [Symbol.iterator](): IterableIterator<PaintRequestList>;
}

interface Plugin { // @type-options: no-export
  /**
   * Returns an iterable of values in the Plugin.
   */
  [Symbol.iterator](): IterableIterator<Plugin>;
}

interface PluginArray { // @type-options: no-export
  /**
   * Returns an iterable of values in the PluginArray.
   */
  [Symbol.iterator](): IterableIterator<PluginArray>;
}

interface SVGLengthList { // @type-options: no-export
  /**
   * Returns an iterable of values in the SVGLengthList.
   */
  [Symbol.iterator](): IterableIterator<SVGLengthList>;
}

interface SVGNumberList { // @type-options: no-export
  /**
   * Returns an iterable of values in the SVGNumberList.
   */
  [Symbol.iterator](): IterableIterator<SVGNumberList>;
}

interface SVGPathSegList { // @type-options: no-export
  /**
   * Returns an iterable of values in the SVGPathSegList.
   */
  [Symbol.iterator](): IterableIterator<SVGPathSegList>;
}

interface SVGPointList { // @type-options: no-export
  /**
   * Returns an iterable of values in the SVGPointList.
   */
  [Symbol.iterator](): IterableIterator<SVGPointList>;
}

interface SVGStringList { // @type-options: no-export
  /**
   * Returns an iterable of values in the SVGStringList.
   */
  [Symbol.iterator](): IterableIterator<SVGStringList>;
}

interface SVGTransformList { // @type-options: no-export
  /**
   * Returns an iterable of values in the SVGTransformList.
   */
  [Symbol.iterator](): IterableIterator<SVGTransformList>;
}

interface SourceBufferList { // @type-options: no-export
  /**
   * Returns an iterable of values in the SourceBufferList.
   */
  [Symbol.iterator](): IterableIterator<SourceBufferList>;
}

interface StyleSheetList { // @type-options: no-export
  /**
   * Returns an iterable of values in the StyleSheetList.
   *
   */
  [Symbol.iterator](): IterableIterator<SourceBufferList>;
}

interface TextTrackCueList { // @type-options: no-export
  /**
   * Returns an iterable of values in the TextTrackCueList.
   */
  [Symbol.iterator](): IterableIterator<TextTrackCueList>;
}

interface TextTrackList { // @type-options: no-export
  /**
   * Returns an iterable of values in the TextTrackList.
   */
  [Symbol.iterator](): IterableIterator<TextTrackList>;
}

interface TouchList { // @type-options: no-export
  /**
   * Returns an iterable of values in the TouchList.
   */
  [Symbol.iterator](): IterableIterator<TouchList>;
}
