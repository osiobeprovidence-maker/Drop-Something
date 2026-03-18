import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, FileText, Check, ArrowRight, ImageIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigate("/dashboard");
      }, 1500);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black/5 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Progress Bar */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-12 rounded-full transition-all duration-500",
                step >= i ? "bg-black" : "bg-black/10"
              )}
            />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-black/5 sm:p-12"
        >
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black/5 text-black">
                  <User size={32} />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-black">Choose your username</h2>
                <p className="mt-2 text-sm text-black/40">This will be your unique URL on DropSomething.</p>
              </div>
              <div className="relative mt-8">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-black/20">dropsomething.com/</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  className="h-14 w-full rounded-2xl border border-black/10 bg-black/5 pl-40 pr-4 text-sm font-medium focus:border-black/30 focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black/5 text-black">
                  <FileText size={32} />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-black">Tell us about yourself</h2>
                <p className="mt-2 text-sm text-black/40">A short bio helps your audience connect with you.</p>
              </div>
              <div className="mt-8">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="I create digital art and share tutorials..."
                  rows={4}
                  className="w-full rounded-2xl border border-black/10 bg-black/5 p-4 text-sm font-medium focus:border-black/30 focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black/5 text-black">
                  <ImageIcon size={32} />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-black">Add a profile picture</h2>
                <p className="mt-2 text-sm text-black/40">Let your audience see the face behind the hustle.</p>
              </div>
              <div className="mt-8 flex justify-center">
                <div className="group relative h-32 w-32 overflow-hidden rounded-[2rem] bg-black/5">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username || "default"}`} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  <button className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <ImageIcon size={24} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={isLoading || (step === 1 && !username)}
            className="mt-10 flex h-14 w-full items-center justify-center rounded-full bg-black text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <div className="flex items-center gap-2">
                {step === 3 ? "Complete Setup" : "Next Step"}
                <ArrowRight size={18} />
              </div>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
