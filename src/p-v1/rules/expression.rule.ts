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
import {
  BinaryOperatorTokenNode,
  ExpressionNode,
  IdentifierTokenNode,
  RawBinaryOperatorTokenNode,
  RawExpressionItemNodes,
} from "../tokens";
import { FunCallRule } from "./fun-call.rule";
import { IdentifierRule } from "./identifier.rule";
import { NumberRule } from "./number.rule";
import { StringRule } from "./string.rule";

export class ExpressionRule extends AbstractRule {
  private iteration = 0;
  private parseOperator = false;
  private isIdentifier = false;

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

    if (this.isIdentifier && char === "(") {
      this.isIdentifier = false;
      this.parseOperator = false;
    }

    if (!this.parseOperator) {
      if (char === '"') {
        this.parseOperator = true;

        props.textReader.moveAnchor(1);
        return {
          type: "CHANGE_RULE",
          tokenName: `${++this.iteration}`,
          factoryRule: () => new StringRule(),
        };
      }

      if (/[0-9]/.test(char)) {
        this.parseOperator = true;

        return {
          type: "CHANGE_RULE",
          tokenName: `${++this.iteration}`,
          factoryRule: () => new NumberRule(),
        };
      }

      if (/[a-z_]/.test(char)) {
        this.isIdentifier = true;
        this.parseOperator = true;

        return {
          type: "CHANGE_RULE",
          tokenName: `${++this.iteration}`,
          factoryRule: () => new IdentifierRule(),
        };
      }

      if (char === "(") {
        this.parseOperator = true;

        props.textReader.moveAnchor(1);

        const lastToken = props.tokens[`${this.iteration}`];
        delete props.tokens[`${this.iteration}`];

        if (!lastToken) {
          throw new Error(
            `Expected identifier at before position ${props.textReader.position}`
          );
        }

        AbstractTokenNode.assertInstanceof(lastToken, IdentifierTokenNode);

        const name = lastToken.name;

        return {
          type: "CHANGE_RULE",
          tokenName: `${++this.iteration}`,
          factoryRule: () => new FunCallRule(name),
        };
      }

      return {
        type: "FINISH_RULE",
      };
    } else {
      this.parseOperator = false;
      this.isIdentifier = false;

      if (/[-\+\*\/]/.test(char)) {
        props.textReader.moveAnchor(1);
        return {
          type: "FINISH_ITERATION",
          tokenName: `${++this.iteration}`,
          factoryToken: () =>
            new RawBinaryOperatorTokenNode({
              chars: char,
              priority: (
                {
                  "+": 1,
                  "-": 1,
                  "*": 2,
                  "/": 2,
                } as Record<string, number>
              )[char],
            }),
        };
      }

      return {
        type: "FINISH_RULE",
      };
    }
  }

  finish(props: ParseFinishProps): AbstractTokenNode {
    const tokens = Object.entries(props.tokens)
      .map(([key, value]) => {
        return [+key, value] as const;
      })
      .sort((a, b) => a[0] - b[0])
      .map((a) => a[1]) as RawExpressionItemNodes[];

    if (tokens.length === 1) {
      return tokens[0];
    }

    const priorities = [] as number[];
    for (const token of tokens) {
      if (token instanceof RawBinaryOperatorTokenNode) {
        priorities.push(token.priority);
      }
    }

    priorities.sort((a, b) => b - a);

    const rawRefTokens = tokens.map((token) => {
      type Ref = {
        node: RawExpressionItemNodes | BinaryOperatorTokenNode;
        refs: Ref[];
      };

      const ref: Ref = {
        node: token as RawExpressionItemNodes | BinaryOperatorTokenNode,
        refs: [],
      };

      return ref;
    });

    for (let priority of priorities) {
      for (let i = 1; i < rawRefTokens.length; i += 2) {
        const token = rawRefTokens[i];

        if (!(token.node instanceof RawBinaryOperatorTokenNode)) {
          continue;
        }

        if (token.node.priority !== priority) {
          continue;
        }

        const node = new BinaryOperatorTokenNode({
          chars: token.node.chars,
          left: rawRefTokens[i - 1].node as any,
          right: rawRefTokens[i + 1].node as any,
        });

        const refs = [
          ...new Set([
            token,
            rawRefTokens[i - 1],
            ...rawRefTokens[i - 1].refs,
            ...token.refs,
            ...rawRefTokens[i + 1].refs,
            rawRefTokens[i + 1],
          ]),
        ];

        for (const ref of refs) {
          ref.node = node;
          ref.refs = refs;
        }
      }
    }

    const nodes: (RawExpressionItemNodes | BinaryOperatorTokenNode)[] = [];
    const set = new Set<RawExpressionItemNodes | BinaryOperatorTokenNode>();

    for (const token of rawRefTokens) {
      if (!set.has(token.node)) {
        nodes.push(token.node);
        set.add(token.node);
      }
    }

    return nodes[0];
  }
}
