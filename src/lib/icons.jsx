import {
  Home, Map, Layers, Headphones, Mic, BookOpen, PenLine, MessagesSquare,
  Bot, Flame, Star, CheckCircle2, TrendingUp, Lock, Check, ArrowRight,
  Sun, Moon, ChevronDown, Trophy, Target, Sparkles,
} from "lucide-react";

/** Central registry so data files can reference icons by string name. */
const REGISTRY = {
  Home, Map, Layers, Headphones, Mic, BookOpen, PenLine, MessagesSquare,
  Bot, Flame, Star, CheckCircle2, TrendingUp, Lock, Check, ArrowRight,
  Sun, Moon, ChevronDown, Trophy, Target, Sparkles,
};

/** Render a lucide icon by name. Falls back to a neutral dot if unknown. */
export function Icon({ name, ...props }) {
  const Cmp = REGISTRY[name] || Sparkles;
  return <Cmp {...props} />;
}

export default REGISTRY;
