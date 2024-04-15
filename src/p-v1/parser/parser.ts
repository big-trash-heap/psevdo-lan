import {
  SKIP_CHARS,
  CHANGE_RULE,
  FINISH_RULE,
  FINISH_ITERATION,
  TRY_CHANGE_RULE,
} from "./constants";

import { AbstractRule } from "./parser-rule";
import { TextReader } from "./text-reader";
import { AbstractTokenNode } from "./token-node";

type RuleWithOptions = {
  rule: AbstractRule;
  begin: number;
  tokens: Record<string, AbstractTokenNode>;
  injectToken: (token: AbstractTokenNode) => void;
  callbackFail?: () => void;
};

export class Parser {
  private text!: string;
  private textReader!: TextReader;
  private rules: RuleWithOptions[] = [];

  private constructor() {}

  static parse(props: { text: string; factoryRule: () => AbstractRule }) {
    const parser = new Parser();

    const rootName = Symbol("INTERNAL") as unknown as string;
    const root: Record<string, AbstractTokenNode> = {};

    parser.text = props.text;
    parser.textReader = TextReader.createFromString({ text: props.text });
    parser.rules.push({
      begin: 0,
      tokens: root,
      rule: props.factoryRule(),
      injectToken: (token) => {
        root[rootName] = token;
      },
    });

    parser.parse();

    const result = root[rootName];
    delete root[rootName];

    return result;
  }

  private parse() {
    while (this.textReader.getAmountLeftChars() > 0) {
      if (this.rules.length === 0) {
        throw new Error("Unexpected end of text");
      }

      const lastRule = this.rules[this.rules.length - 1]!;
      try {
        this.runRule(lastRule);
      } catch (error) {
        if (lastRule.callbackFail) {
          lastRule.callbackFail();
          this.rules.pop();
        } else {
          throw error;
        }
      }
    }

    const reverseRules = [...this.rules].reverse();
    for (let ruleWithOptions of reverseRules) {
      const { tokens, rule } = ruleWithOptions;

      const textReader = TextReader.createFromAnchorTextReader(this.textReader);
      const ruleResult = rule.parse({ textReader, tokens });

      const isSkippedAll = textReader.getAmountReadChars() === 0;

      if (ruleResult.type !== FINISH_RULE && !isSkippedAll) {
        throw new Error("Unexpected end of text");
      }

      this.ruleRunFinish({
        ...ruleWithOptions,
        end: this.textReader.position,
        textReader,
      });
    }
  }

  private runRule(ruleWithOptions: RuleWithOptions) {
    const { tokens, rule } = ruleWithOptions;

    const originalTextReader = TextReader.createFromAnchorTextReader(
      this.textReader
    );
    const textReader = TextReader.createFromAnchorTextReader(this.textReader);
    const ruleResult = rule.parse({ textReader, tokens });

    if (textReader.getAmountReadChars() > 0) {
      this.textReader.moveAnchorByTextReader(textReader);
    }

    const end = this.textReader.position;
    const ruleOptionsWithEnd = { ...ruleWithOptions, textReader, end };

    if (ruleResult.type === SKIP_CHARS) {
      if (textReader.getAmountLeftChars() === 0) {
        this.ruleRunFinish(ruleOptionsWithEnd);
      }
      return;
    }

    if (
      ruleResult.type === CHANGE_RULE ||
      ruleResult.type === TRY_CHANGE_RULE
    ) {
      const newRule = ruleResult.factoryRule();
      const newTokens: Record<string, AbstractTokenNode> = {};
      const newInjectToken = (token: AbstractTokenNode) => {
        tokens[ruleResult.tokenName] = token;
      };

      this.rules.push({
        begin: end,
        rule: newRule,
        tokens: newTokens,
        injectToken: newInjectToken,
        callbackFail:
          ruleResult.type === TRY_CHANGE_RULE
            ? () => {
                this.textReader = originalTextReader;
                ruleResult.callbackFail();
              }
            : undefined,
      });

      return;
    }

    if (ruleResult.type === FINISH_ITERATION) {
      tokens[ruleResult.tokenName] = ruleResult.factoryToken();
      return;
    }

    if (ruleResult.type === FINISH_RULE) {
      this.ruleRunFinish(ruleOptionsWithEnd);
      return;
    }

    throw new Error("Unexpected rule result");
  }

  private ruleRunFinish(props: {
    textReader: TextReader;
    rule: AbstractRule;
    begin: number;
    end: number;
    tokens: Record<string, AbstractTokenNode>;
    injectToken: (token: AbstractTokenNode) => void;
  }) {
    this.rules.pop();

    const token = props.rule.finish({
      textReader: props.textReader,
      begin: props.begin,
      end: props.end,
      tokens: props.tokens,
    });

    props.injectToken(token);
  }
}
