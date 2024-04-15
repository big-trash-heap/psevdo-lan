import {
  AbstractRule,
  AbstractTokenNode,
  ParseFinishProps,
  ParseRuleChangeRuleResult,
  ParseRuleFinishIterationResult,
  ParseRuleFinishRuleResult,
  ParseRuleProps,
  ParseRuleSkipCharsResult,
} from "../parser";
import { FunReturnTokenNode } from "../tokens";
import { ExpressionRule } from "./expression.rule";

export class FunReturnRule extends AbstractRule {
  private isEndof = false;

  parse(
    props: ParseRuleProps
  ):
    | ParseRuleSkipCharsResult
    | ParseRuleChangeRuleResult
    | ParseRuleFinishRuleResult
    | ParseRuleFinishIterationResult {
    if (this.isEndof) {
      return {
        type: "FINISH_RULE",
      };
    }

    const chars = props.textReader.getChars("return ".length);
    props.textReader.moveAnchorByChars(chars);

    if (chars !== "return ") {
      throw new Error(`Expected 'return' but got ${chars}`);
    }

    this.isEndof = true;
    return {
      type: "CHANGE_RULE",
      tokenName: "expression",
      factoryRule: () => new ExpressionRule(),
    };
  }
  finish(props: ParseFinishProps): AbstractTokenNode {
    return new FunReturnTokenNode(props.tokens["expression"] as any);
  }
}
