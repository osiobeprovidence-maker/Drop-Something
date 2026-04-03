import { ShieldCheck, CircleHelp, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { PLATFORM_PAYMENT_PROVIDER } from "@/src/content/siteContent";
import { cn } from "@/src/lib/utils";

export function PaymentTrustNotice({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-black/10 bg-black/[0.03] p-4",
        compact ? "space-y-2" : "space-y-3",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-black/65">
          <ShieldCheck size={14} />
          Secure checkout
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-black/65">
          <BadgeCheck size={14} />
          Powered by {PLATFORM_PAYMENT_PROVIDER}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-black/65">
        Payments are processed securely through {PLATFORM_PAYMENT_PROVIDER}. Sensitive payment details are handled by{" "}
        {PLATFORM_PAYMENT_PROVIDER} and are not stored on DropSomething servers.
      </p>
      <p className="flex items-center gap-2 text-sm text-black/55">
        <CircleHelp size={14} />
        Need help with a payment or order?{" "}
        <Link to="/contact" className="font-semibold text-black underline underline-offset-4">
          Contact support
        </Link>
        .
      </p>
    </div>
  );
}
