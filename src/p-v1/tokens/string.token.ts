import { AbstractTokenNode } from "../parser";

export class StringTokenNode extends AbstractTokenNode {
  constructor(public readonly string: string) {
    super();
  }
}
