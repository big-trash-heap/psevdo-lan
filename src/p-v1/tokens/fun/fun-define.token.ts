import { AbstractTokenNode } from "../../parser";
import { BlockExpressionNode } from "../types";

export class FunDefineTokenNode extends AbstractTokenNode {
  public readonly name!: string;
  public readonly args!: string[];
  public readonly body!: BlockExpressionNode[];

  constructor(props: {
    name: string;
    args: string[];
    body: BlockExpressionNode[];
  }) {
    super();

    this.name = props.name;
    this.args = props.args;
    this.body = props.body;
  }
}
