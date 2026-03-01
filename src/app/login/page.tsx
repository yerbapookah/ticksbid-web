"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

type Step = "phone" | "verify" | "profile";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginFlow />
    </Suspense>
  );
}

function LoginFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignup = searchParams.get("signup") === "true";
  const { login } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Format phone as (XXX) XXX-XXXX
  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function phoneDigits() {
    return phone.replace(/\D/g, "");
  }

  async function handleSendCodeWithPhone(digits?: string) {
    const ph = digits || phoneDigits();
    if (ph.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: ph }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setStep("verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleSendCode() {
    handleSendCodeWithPhone();
  }

  async function handleVerifyWithCode(fullCode: string) {
    if (fullCode.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneDigits(), code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      if (data.isNewUser && isSignup) {
        setStep("profile");
      } else {
        login(data.username || "User", phoneDigits());
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleVerifyCode() {
    handleVerifyWithCode(code.join(""));
  }

  async function handleCreateProfile() {
    if (!username.trim()) {
      setError("Please choose a username");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    setLoading(true);
    setError("");
    // TODO: Call API to persist user profile to database
    await new Promise((r) => setTimeout(r, 500));
    login(username, phoneDigits());
    setLoading(false);
    router.push("/");
  }

  function handleCodeInput(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/\d/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    setError("");
    if (value && index < 5) {
      const el = document.getElementById(`code-${index + 1}`);
      el?.focus();
    }
    // Auto-submit when all 6 digits entered
    if (value && index === 5 && next.every((d) => d !== "")) {
      setTimeout(() => handleVerifyWithCode(next.join("")), 100);
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const el = document.getElementById(`code-${index - 1}`);
      el?.focus();
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      setTimeout(() => handleVerifyWithCode(pasted), 100);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <svg width={48} height={48} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
            <defs>
              <linearGradient id="login-lg" x1="0" y1="0" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a5b4fc" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <path d="M4 8a4 4 0 014-4h20a4 4 0 014 4v8.27a4 4 0 00-2.5 3.73 4 4 0 002.5 3.73V32a4 4 0 01-4 4H8a4 4 0 01-4-4V23.73A4 4 0 006.5 20 4 4 0 004 16.27V8z" fill="url(#login-lg)" />
            <line x1="8" y1="20" x2="32" y2="20" stroke="white" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2.5" />
            <rect x="10" y="12" width="16" height="4" rx="1" fill="white" fillOpacity="0.92" />
            <rect x="15.5" y="12" width="5" height="16" rx="1" fill="white" fillOpacity="0.92" />
          </svg>

          {step === "phone" && (
            <>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{isSignup ? "Create your account" : "Sign in to TicksBid"}</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Enter your phone number to {isSignup ? "get started" : "sign in"}</p>
            </>
          )}
          {step === "verify" && (
            <>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Verify your number</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">We sent a code to +1 {phone}</p>
            </>
          )}
          {step === "profile" && (
            <>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create your profile</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Pick a username and add your email</p>
            </>
          )}
        </div>

        {/* Step 1: Phone number */}
        {step === "phone" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Phone number</label>
              <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 focus-within:border-[var(--accent)]/50 transition-colors">
                <span className="text-sm text-[var(--text-muted)]">🇺🇸 +1</span>
                <div className="h-5 w-px bg-[var(--border)]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setPhone(formatted);
                    setError("");
                    const digits = formatted.replace(/\D/g, "");
                    if (digits.length === 10) {
                      setTimeout(() => handleSendCodeWithPhone(digits), 100);
                    }
                  }}
                  placeholder="(555) 123-4567"
                  className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                />
              </div>
            </div>

            {error && <p className="text-xs text-[var(--red)]">{error}</p>}

            {loading && (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-[var(--text-muted)]">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Sending code…
              </div>
            )}

            <p className="text-center text-[0.65rem] text-[var(--text-muted)] leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy Policy. We&apos;ll send you an SMS to verify your number.
            </p>
          </div>
        )}

        {/* Step 2: Verify code */}
        {step === "verify" && (
          <div className="space-y-4">
            <div>
              <label className="mb-3 block text-xs font-medium text-[var(--text-secondary)]">Verification code</label>
              <div className="flex justify-between gap-2" onPaste={handleCodePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`code-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeInput(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    autoFocus={i === 0}
                    className="h-14 w-14 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center text-xl font-bold text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]/50"
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-[var(--red)]">{error}</p>}

            {loading && (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-[var(--text-muted)]">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Verifying…
              </div>
            )}

            <div className="flex items-center justify-between">
              <button onClick={() => { setStep("phone"); setCode(["", "", "", "", "", ""]); setError(""); }} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                ← Change number
              </button>
              <button onClick={handleSendCode} className="text-xs text-[var(--accent-hover)] hover:text-[var(--accent)] transition-colors">
                Resend code
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Profile completion */}
        {step === "profile" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")); setError(""); }}
                placeholder="johndoe"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors focus:border-[var(--accent)]/50"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="john@example.com"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors focus:border-[var(--accent)]/50"
                onKeyDown={(e) => e.key === "Enter" && handleCreateProfile()}
              />
            </div>

            {error && <p className="text-xs text-[var(--red)]">{error}</p>}

            <button
              onClick={handleCreateProfile}
              disabled={loading || !username.trim() || !email.includes("@")}
              className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Creating account…
                </span>
              ) : "Get started"}
            </button>
          </div>
        )}

        {/* Progress dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {((isSignup ? ["phone", "verify", "profile"] : ["phone", "verify"]) as Step[]).map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${s === step ? "w-6 bg-[var(--accent)]" : "w-1.5 bg-[var(--border)]"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
