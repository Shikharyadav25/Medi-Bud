export type ChatRole = "user" | "assistant" | "system";

export type ChatSource =
  | "cloud"
  | "intent"
  | "decision_tree"
  | "manual"
  | "outbox_pending";

export type CardType =
  | "stat"
  | "tip"
  | "warn"
  | "avoid"
  | "remedy"
  | "food"
  | "med";

export type CardIconKey =
  | "check"
  | "x"
  | "alert"
  | "heart"
  | "activity"
  | "zap"
  | "leaf"
  | "droplet"
  | "scale"
  | "shield"
  | "flame"
  | "utensils"
  | "pill"
  | "info"
  | "star"
  | "thermometer";

export interface MedicalCard {
  type: CardType;
  icon?: CardIconKey;
  label: string;
  value?: string;
  text?: string;
  badge?: string;
}

export type TriageUrgency = "emergency" | "soon" | "monitor" | "self_care";

export interface DecisionTreeOption {
  label: string;
  nextNodeId: string;
  targetTreeId?: string;
  description?: string;
}

export interface DecisionTreeNode {
  id: string;
  question: string;
  explanation?: string;
  options?: DecisionTreeOption[];
  isTerminal?: boolean;
  urgency?: TriageUrgency;
  recommendation?: string;
  cards?: MedicalCard[];
}

export interface DecisionTree {
  id: string;
  title: string;
  triggerKeywords: string[];
  rootNodeId: string;
  nodes: Record<string, DecisionTreeNode>;
}

export interface DecisionTreeState {
  treeId: string;
  currentNodeId: string;
  history: Array<{ nodeId: string; chosenOption: string }>;
}

export interface HealthIntent {
  id: string;
  title: string;
  category: "first_aid" | "emergency" | "pediatric" | "general_health";
  keywords: string[];
  regexPatterns?: string[];
  urgency: TriageUrgency;
  immediateSteps: string[];
  redFlags?: string[];
  doNotDo?: string[];
  cards?: MedicalCard[];
  disclaimer?: string;
}

export interface ManualArticle {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  overview: string;
  symptoms?: string[];
  remedies?: string[];
  dietaryTips?: string[];
  whenToSeeDoctor?: string[];
  cards?: MedicalCard[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  cards?: MedicalCard[];
  interactiveOptions?: DecisionTreeOption[];
  activeTreeId?: string;
  imageUri?: string;
  imageBase64?: string;
  source: ChatSource;
  isOffline: boolean;
  createdAt: number;
}

export interface Conversation {
  id: string;
  profileId?: number;
  title: string;
  createdAt: number;
  updatedAt: number;
}

