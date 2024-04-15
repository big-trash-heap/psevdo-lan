import { AbstractTokenNode } from "../parser";
import { FunDefineTokenNode } from "./fun";

export class ProgramTokenNode extends AbstractTokenNode {
  constructor(public readonly funcs: Record<string, FunDefineTokenNode>) {
    super();
  }
}
