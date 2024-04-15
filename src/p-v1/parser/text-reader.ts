import { assertNumberIsIntegerPositive } from "./asserts";

export class TextReader {
  #text!: string;
  #offset: number = 0;
  #anchor: number = 0;

  private constructor() {}

  static createFromString(props: { text: string }): TextReader {
    const textReader = new TextReader();
    textReader.#text = props.text;
    return textReader;
  }

  static createFromAnchorTextReader(textReader: TextReader): TextReader {
    const textReaderClone = new TextReader();
    textReaderClone.#text = textReader.#text;
    textReaderClone.#offset = textReader.position;
    return textReaderClone;
  }

  get position(): number {
    return this.#anchor + this.#offset;
  }

  getAmountReadChars(): number {
    return this.#anchor;
  }

  getAmountLeftChars(): number {
    return this.#text.length - this.position;
  }

  getChars(amount: number = 1): string {
    assertNumberIsIntegerPositive(amount);

    return this.#text.slice(this.position, this.position + amount);
  }

  getReadChars(): string {
    return this.#text.slice(this.#offset, this.#offset + this.#anchor);
  }

  moveAnchor(amount: number = 1) {
    assertNumberIsIntegerPositive(amount);

    this.#anchor += Math.min(amount, this.getAmountLeftChars());
    return this;
  }

  moveAnchorByChars(chars: string) {
    return this.moveAnchor(chars.length);
  }

  moveAnchorByTextReader(textReader: TextReader) {
    return this.moveAnchor(textReader.#anchor);
  }
}
