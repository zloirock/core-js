// use only with DOM lib
interface ArrayIterator<T> extends IteratorObject<T, BuiltinIteratorReturn, unknown> { // @type-options no-export
  [Symbol.iterator](): ArrayIterator<T>;
}

interface DOMTokenList { // @type-options no-export
  /**
   * Calls a defined callback function on each element of the DOMTokenList,
   * passing the element, its index, and the entire DOMTokenList as arguments.
   * @param callbackfn
   * @param thisArg
   */
  forEach(
    callbackfn: (value: Element, index: number, collection: DOMTokenList) => void,
    thisArg?: any
  ): void;

  /**
   * Returns an iterable of keys in the DOMTokenList.
   */
  keys(): Iterable<number>;

  /**
   * Returns an iterable of values in the DOMTokenList.
   */
  values(): Iterable<Element>;

  /**
   * Returns an iterable of key, value pairs in the DOMTokenList.
   */
  entries(): Iterable<[number, Element]>;

  [Symbol.iterator](): Iterable<Element>;
}

interface NodeList { // @type-options no-export
  /**
   * Calls a defined callback function on each element of the NodeList,
   * passing the element, its index, and the entire NodeList as arguments.
   * @param callbackfn
   * @param thisArg
   */
  forEach(
    callbackfn: (value: Node, index: number, collection: NodeList) => void,
    thisArg?: any
  ): void;

  /**
   * Returns an iterable of keys in the NodeList.
   */
  keys(): Iterable<number>;

  /**
   * Returns an iterable of values in the NodeList.
   */
  values(): Iterable<Node>;

  /**
   * Returns an iterable of key, value pairs in the NodeList.
   */
  entries(): Iterable<[number, Node]>;

  /**
   * Returns an iterable of values in the NodeList.
   */
  [Symbol.iterator](): Iterable<Node>;
}

interface CSSRuleList { // @type-options no-export
  /**
   * Returns an iterable of values in the CSSRuleList.
   */
  [Symbol.iterator](): Iterable<CSSRuleList>;
}

interface CSSStyleDeclaration { // @type-options no-export
  /**
   * Returns an iterable of values in the CSSStyleDeclaration.
   */
  [Symbol.iterator](): Iterable<CSSStyleDeclaration>;
}

interface CSSValueList { // @type-options no-export
  /**
   * Returns an iterable of values in the CSSValueList.
   */
  [Symbol.iterator](): Iterable<CSSValueList>;
}

interface ClientRectList { // @type-options no-export
  /**
   * Returns an iterable of values in the ClientRectList.
   */
  [Symbol.iterator](): Iterable<ClientRectList>;
}

interface DOMRectList { // @type-options no-export
  /**
   * Returns an iterable of values in the DOMRectList.
   */
  [Symbol.iterator](): Iterable<DOMRectList>;
}

interface DOMStringList { // @type-options no-export
  /**
   * Returns an iterable of values in the DOMStringList.
   */
  [Symbol.iterator](): Iterable<DOMStringList>;
}

interface DataTransferItemList { // @type-options no-export
  /**
   * Returns an iterable of values in the DataTransferItemList.
   */
  [Symbol.iterator](): Iterable<DataTransferItemList>;
}

interface FileList { // @type-options no-export
  /**
   * Returns an iterable of values in the FileList.
   */
  [Symbol.iterator](): Iterable<FileList>;
}

interface HTMLAllCollection { // @type-options no-export
  /**
   * Returns an iterable of values in the HTMLAllCollection.
   */
  [Symbol.iterator](): Iterable<HTMLAllCollection>;
}

interface HTMLCollection { // @type-options no-export
  /**
   * Returns an iterable of values in the HTMLCollection.
   */
  [Symbol.iterator](): ArrayIterator<Element>;
}

interface HTMLFormElement { // @type-options no-export
  /**
   * Returns an iterable of values in the HTMLFormElement.
   */
  [Symbol.iterator](): Iterable<Element>;
}

interface HTMLSelectElement { // @type-options no-export
  /**
   * Returns an iterable of values in the HTMLSelectElement.
   */
  [Symbol.iterator](): Iterable<HTMLOptionElement>;
}

interface MediaList { // @type-options no-export
  /**
   * Returns an iterable of values in the MediaList.
   */
  [Symbol.iterator](): Iterable<MediaList>;
}

interface MimeTypeArray { // @type-options no-export
  /**
   * Returns an iterable of values in the MimeTypeArray.
   */
  [Symbol.iterator](): Iterable<MimeTypeArray>;
}

interface NamedNodeMap { // @type-options no-export
  /**
   * Returns an iterable of values in the NamedNodeMap.
   */
  [Symbol.iterator](): Iterable<NamedNodeMap>;
}

interface PaintRequestList { // @type-options no-export
  /**
   * Returns an iterable of values in the PaintRequestList.
   */
  [Symbol.iterator](): Iterable<PaintRequestList>;
}

interface Plugin { // @type-options no-export
  /**
   * Returns an iterable of values in the Plugin.
   */
  [Symbol.iterator](): Iterable<Plugin>;
}

interface PluginArray { // @type-options no-export
  /**
   * Returns an iterable of values in the PluginArray.
   */
  [Symbol.iterator](): Iterable<PluginArray>;
}

interface SVGLengthList { // @type-options no-export
  /**
   * Returns an iterable of values in the SVGLengthList.
   */
  [Symbol.iterator](): Iterable<SVGLengthList>;
}

interface SVGNumberList { // @type-options no-export
  /**
   * Returns an iterable of values in the SVGNumberList.
   */
  [Symbol.iterator](): Iterable<SVGNumberList>;
}

interface SVGPathSegList { // @type-options no-export
  /**
   * Returns an iterable of values in the SVGPathSegList.
   */
  [Symbol.iterator](): Iterable<SVGPathSegList>;
}

interface SVGPointList { // @type-options no-export
  /**
   * Returns an iterable of values in the SVGPointList.
   */
  [Symbol.iterator](): Iterable<SVGPointList>;
}

interface SVGStringList { // @type-options no-export
  /**
   * Returns an iterable of values in the SVGStringList.
   */
  [Symbol.iterator](): Iterable<SVGStringList>;
}

interface SVGTransformList { // @type-options no-export
  /**
   * Returns an iterable of values in the SVGTransformList.
   */
  [Symbol.iterator](): Iterable<SVGTransformList>;
}

interface SourceBufferList { // @type-options no-export
  /**
   * Returns an iterable of values in the SourceBufferList.
   */
  [Symbol.iterator](): Iterable<SourceBufferList>;
}

interface StyleSheetList { // @type-options no-export
  /**
   * Returns an iterable of values in the StyleSheetList.
   *
   */
  [Symbol.iterator](): Iterable<SourceBufferList>;
}

interface TextTrackCueList { // @type-options no-export
  /**
   * Returns an iterable of values in the TextTrackCueList.
   */
  [Symbol.iterator](): Iterable<TextTrackCueList>;
}

interface TextTrackList { // @type-options no-export
  /**
   * Returns an iterable of values in the TextTrackList.
   */
  [Symbol.iterator](): Iterable<TextTrackList>;
}

interface TouchList { // @type-options no-export
  /**
   * Returns an iterable of values in the TouchList.
   */
  [Symbol.iterator](): Iterable<TouchList>;
}
