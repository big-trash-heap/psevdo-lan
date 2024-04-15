import { AbstractTokenNode } from "../../parser";

export class RawBinaryOperatorTokenNode extends AbstractTokenNode {
  public readonly chars!: string;
  public readonly priority!: number;

  constructor(props: { chars: string; priority: number }) {
    super();

    this.chars = props.chars;
    this.priority = props.priority;
  }
}
