import { DecisionTree, DecisionTreeOption, MedicalCard, TriageUrgency } from "../types";
import { DECISION_TREES } from "./decisionTreesData";

export interface DecisionTreeStepResult {
  message: string;
  options?: DecisionTreeOption[];
  isTerminal: boolean;
  urgency?: TriageUrgency;
  cards?: MedicalCard[];
  activeTreeId?: string;
}

export function matchDecisionTree(query: string): DecisionTree | null {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return null;

  for (const tree of Object.values(DECISION_TREES)) {
    for (const kw of tree.triggerKeywords) {
      if (normalized.includes(kw.toLowerCase())) {
        return tree;
      }
    }
  }

  // Generic triage triggers fallback to chest pain or fever
  if (
    normalized.includes("guided triage") ||
    normalized.includes("symptom check") ||
    normalized.includes("interactive triage")
  ) {
    return DECISION_TREES.fever;
  }

  return null;
}

export function startDecisionTree(treeId: string): DecisionTreeStepResult | null {
  const tree = DECISION_TREES[treeId];
  if (!tree) return null;

  const rootNode = tree.nodes[tree.rootNodeId];
  if (!rootNode) return null;

  return {
    message: `🩺 **${tree.title}**\n\n${rootNode.question}`,
    options: rootNode.options || [],
    isTerminal: false,
    activeTreeId: tree.id,
    cards: rootNode.cards,
  };
}

export function advanceDecisionTree(
  treeId: string,
  targetNodeId: string
): DecisionTreeStepResult | null {
  const tree = DECISION_TREES[treeId];
  if (!tree) return null;

  const node = tree.nodes[targetNodeId];
  if (!node) return null;

  if (node.isTerminal) {
    const urgencyBadge =
      node.urgency === "emergency"
        ? "🚨 EMERGENCY FINDING"
        : node.urgency === "soon"
        ? "⚠️ CLINICAL ATTENTION RECOMMENDED"
        : "✅ HOME SELF-CARE GUIDELINE";

    const fullMessage = `${urgencyBadge}\n**${node.question}**\n\n${node.recommendation}\n\n*This offline diagnostic flowchart is for educational guidance and does not replace emergency medical assessment.*`;

    return {
      message: fullMessage,
      options: undefined,
      isTerminal: true,
      urgency: node.urgency,
      cards: node.cards,
      activeTreeId: undefined,
    };
  }

  return {
    message: node.question,
    options: node.options || [],
    isTerminal: false,
    activeTreeId: tree.id,
    cards: node.cards,
  };
}
