import {
  SKIP_CHARS,
  CHANGE_RULE,
  FINISH_RULE,
  FINISH_ITERATION,
  TRY_CHANGE_RULE,
} from "./constants";

import { TextReader } from "./text-reader";
import { AbstractTokenNode } from "./token-node";

export type ParseRuleProps = {
  textReader: TextReader;
  tokens: Record<string, AbstractTokenNode>;
};

export type ParseFinishProps = {
  textReader: TextReader;
  begin: number;
  end: number;
  tokens: Record<string, AbstractTokenNode>;
};

export type ParseRuleSkipCharsResult = {
  type: typeof SKIP_CHARS;
};

export type ParseRuleChangeRuleResult = {
  type: typeof CHANGE_RULE;
  tokenName: string;
  factoryRule: () => AbstractRule;
};

export type ParseRuleFinishRuleResult = {
  type: typeof FINISH_RULE;
};

export type ParseRuleFinishIterationResult = {
  type: typeof FINISH_ITERATION;
  tokenName: string;
  factoryToken: () => AbstractTokenNode;
};

export type ParseRuleTryChangeRuleResult = {
  type: typeof TRY_CHANGE_RULE;
  tokenName: string;
  factoryRule: () => AbstractRule;
  callbackFail: () => void;
};

export abstract class AbstractRule {
  abstract parse(
    props: ParseRuleProps
  ):
    | ParseRuleSkipCharsResult
    | ParseRuleChangeRuleResult
    | ParseRuleFinishRuleResult
    | ParseRuleFinishIterationResult
    | ParseRuleTryChangeRuleResult;

  abstract finish(props: ParseFinishProps): AbstractTokenNode;
}
