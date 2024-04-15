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
import { FunCallTokenNode } from "../tokens";
import { ExpressionRule } from "./expression.rule";

export class FunCallRule extends AbstractRule {
  private iteration = 0;
  private isNeedParseExpression = true;

  constructor(public readonly name: string) {
    super();
  }

  parse(
    props: ParseRuleProps
  ):
    | ParseRuleSkipCharsResult
    | ParseRuleChangeRuleResult
    | ParseRuleFinishRuleResult
    | ParseRuleFinishIterationResult {
    const char = props.textReader.getChars();

    if (/[ \t\n]/.test(char)) {
      props.textReader.moveAnchor(1);
      return {
        type: "SKIP_CHARS",
      };
    }

    if (props.textReader.getChars(2) === "//") {
      props.textReader.moveAnchor(2);

      while (!/[\n]/.test(props.textReader.getChars())) {
        props.textReader.moveAnchor(1);
      }

      props.textReader.moveAnchor(1);
      return {
        type: "SKIP_CHARS",
      };
    }

    if (char === ")") {
      props.textReader.moveAnchor(1);
      return {
        type: "FINISH_RULE",
      };
    }

    if (char === ",") {
      props.textReader.moveAnchor(1);

      if (this.isNeedParseExpression) {
        throw new Error("Unexpected ','");
      }

      this.isNeedParseExpression = true;
      return {
        type: "SKIP_CHARS",
      };
    }

    if (this.isNeedParseExpression) {
      this.isNeedParseExpression = false;
      return {
        type: "CHANGE_RULE",
        tokenName: `${++this.iteration}`,
        factoryRule: () => new ExpressionRule(),
      };
    }

    throw new Error("Unexpected char");
  }
  finish(props: ParseFinishProps): AbstractTokenNode {
    const tokens = Object.entries(props.tokens)
      .map(([key, value]) => {
        return [+key, value] as const;
      })
      .sort((a, b) => a[0] - b[0])
      .map((a) => a[1]);

    return new FunCallTokenNode({
      name: this.name,
      args: tokens as any,
    });
  }
}
