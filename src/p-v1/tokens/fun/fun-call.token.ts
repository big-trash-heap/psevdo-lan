import { AbstractTokenNode } from "../../parser";
import { ExpressionNode } from "../types";

export class FunCallTokenNode extends AbstractTokenNode {
  public readonly name!: string;
  public readonly args!: ExpressionNode[];

  constructor(props: { name: string; args: ExpressionNode[] }) {
    super();

    this.name = props.name;
    this.args = props.args;
  }
}
