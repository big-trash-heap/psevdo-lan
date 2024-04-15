import { AbstractTokenNode } from "../parser";

export class NumberTokenNode extends AbstractTokenNode {
  constructor(public readonly number: number) {
    super();
  }
}
