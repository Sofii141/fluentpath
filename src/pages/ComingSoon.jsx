import { Hammer } from "lucide-react";
import { Icon } from "../lib/icons";

export default function ComingSoon({ iconName = "Sparkles", title = "Coming soon", phase = "" }) {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="animate-pop">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon name={iconName} size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold text-main">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-soft">
          This module is on the way. We're building EnglishUp step by step{phase ? ` — ${phase}` : ""}.
        </p>
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mute">
          <Hammer size={15} /> In development
        </p>
      </div>
    </div>
  );
}
