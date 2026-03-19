import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, FileText, Check, ArrowRight, ImageIcon, Camera, AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "../context/AuthContext";

export default function Onboarding() {
  const navigate = useNavigate();
  const { convexUserId, user, reloadUser } = useAuth();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.creators.generateUploadUrl);
  const createCreator = useMutation(api.creators.createCreator);

  const checkEmailVerification = async () => {
    setIsVerifying(true);
    try {
      await reloadUser();
      if (auth.currentUser?.emailVerified) {
        alert("Email verified!");
      } else {
        alert("Email still not verified. Please check your inbox and click the link.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!convexUserId) return;
      
      // Optional: enforce email verification
      // if (!user?.emailVerified) {
      //   setError("Please verify your email before completing setup.");
      //   return;
      // }

      setIsLoading(true);
      setError("");
      
      try {
        await createCreator({
          userId: convexUserId,
          username: username.toLowerCase(),
          name: username,
          bio: bio,
          avatar: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          coverImage: "https://picsum.photos/seed/cover/1200/400",
          pageStyle: "hybrid",
        });
        navigate("/dashboard");
      } catch (err: any) {
        console.error("Onboarding error:", err);
        setError(err.message || "Failed to complete setup. Username might be taken.");
        setStep(1); // Go back to username step
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // 1. Get upload URL from Convex
      const postUrl = await generateUploadUrl();
      
      // 2. Post file to Convex storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) throw new Error("Upload failed");
      
      const { storageId } = await result.json();
      
      // 3. Get the permanent URL from Convex using our getFileUrl query
      // This is safer than manual URL construction
      setAvatarUrl(storageId); // We store the storageId and resolve it when displaying
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const avatarDisplayUrl = useQuery(api.creators.getFileUrl, 
    avatarUrl.length > 20 ? { storageId: avatarUrl } : "skip" as any
  ) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || "default"}`;

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
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-500 border border-rose-100">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black/5 text-black">
                  <User size={32} />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-black">Choose your username</h2>
                <p className="mt-2 text-sm text-black/40">This will be your unique URL on DropSomething.</p>
              </div>

              {/* Email Verification Banner */}
              {!user?.emailVerified && (
                <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-amber-500 shrink-0" size={20} />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-amber-800">Email not verified</p>
                      <p className="text-[10px] text-amber-600 mt-0.5">Please check your inbox to verify your account.</p>
                    </div>
                    <button 
                      onClick={checkEmailVerification}
                      disabled={isVerifying}
                      className="text-[10px] font-bold text-amber-700 underline underline-offset-2 disabled:opacity-50"
                    >
                      {isVerifying ? "Checking..." : "I've verified"}
                    </button>
                  </div>
                </div>
              )}

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
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative h-32 w-32 overflow-hidden rounded-[2rem] bg-black/5 border-2 border-dashed border-black/10 hover:border-black/30 transition-all"
                >
                  {avatarUrl ? (
                    <img src={avatarDisplayUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-black/20">
                      <Camera size={32} />
                      <span className="mt-2 text-[10px] font-bold uppercase tracking-widest">Upload</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera size={24} />
                  </div>
                </button>
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
