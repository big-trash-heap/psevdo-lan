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
import { FunDefineTokenNode, ProgramTokenNode } from "../tokens";
import { FunDefineRule } from "./fun-define.rule";

export class ProgramRule extends AbstractRule {
  private iteration = 0;

  parse(
    props: ParseRuleProps
  ):
    | ParseRuleSkipCharsResult
    | ParseRuleChangeRuleResult
    | ParseRuleFinishRuleResult
    | ParseRuleFinishIterationResult {
    const char = props.textReader.getChars();

    if (/[ \t\n]/.test(char)) {
      props.textReader.moveAnchor();
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

    if (props.textReader.getChars("fun ".length) === "fun ") {
      return {
        type: "CHANGE_RULE",
        tokenName: `${++this.iteration}`,
        factoryRule: () => new FunDefineRule(),
      };
    }

    throw new Error(`Expected 'fun' but got ${char}`);
  }

  finish(props: ParseFinishProps): AbstractTokenNode {
    const funcs = props.tokens as Record<string, FunDefineTokenNode>;
    const funcsByName = {} as Record<string, FunDefineTokenNode>;

    for (const func of Object.values(funcs)) {
      funcsByName[func.name] = func;
    }

    return new ProgramTokenNode(funcsByName);
  }
}
