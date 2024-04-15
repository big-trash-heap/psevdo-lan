import type { NumberTokenNode } from "./number.token";
import type { StringTokenNode } from "./string.token";
import type { IdentifierTokenNode } from "./identifier.token";
import type {
  RawBinaryOperatorTokenNode,
  BinaryOperatorTokenNode,
} from "./binary-operator";
import type { FunCallTokenNode, FunReturnTokenNode } from "./fun";
import {
  AssignmentTokenNode,
  BindAssignmentTokenNode,
} from "./assignment-operator";

export type RawExpressionItemNodes =
  | StringTokenNode
  | NumberTokenNode
  | IdentifierTokenNode
  | FunCallTokenNode
  | RawBinaryOperatorTokenNode;

export type ExpressionNode =
  | StringTokenNode
  | NumberTokenNode
  | IdentifierTokenNode
  | FunCallTokenNode
  | BinaryOperatorTokenNode;

export type BlockExpressionNode =
  | FunCallTokenNode
  | AssignmentTokenNode
  | BindAssignmentTokenNode
  | FunReturnTokenNode;
