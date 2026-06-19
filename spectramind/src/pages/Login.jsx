import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const highlights = [
  "Audit-ready evidence workflows",
  "Risk and vendor visibility",
  "Trust center built for customers",
];

export default function Login() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [googleStatus, setGoogleStatus] = useState("");

  const handleGoogleCredential = useCallback(
    (response) => {
      const profile = decodeJwt(response.credential);

      localStorage.setItem(
        "spectramind_google_user",
        JSON.stringify({
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
        })
      );

      navigate("/dashboard");
    },
    [navigate]
  );

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    const scriptId = "google-identity-services";

    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        size: "large",
        theme: "outline",
        type: "standard",
        shape: "rectangular",
        text: "continue_with",
        width: 360,
      });
    };

    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => {
      setGoogleStatus("Google sign-in could not load. Please try email sign-in.");
    };

    document.head.appendChild(script);
  }, [handleGoogleCredential]);

  const handleEmailSignIn = (event) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  const handleGoogleFallback = () => {
    if (!googleClientId) {
      setGoogleStatus("Add VITE_GOOGLE_CLIENT_ID to enable Google sign-in.");
      return;
    }

    setGoogleStatus("Google sign-in is loading. Please try again in a moment.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-slate-950 px-12 py-8 lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,.35),transparent_30%),radial-gradient(circle_at_85%_30%,rgba(16,185,129,.22),transparent_28%)]" />

          <Link to="/" className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-xl font-bold">
              S
            </span>
            <span className="text-2xl font-bold">SpectraMind</span>
          </Link>

          <div className="relative flex flex-1 flex-col justify-center py-8">
            <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100">
              <Sparkles size={16} />
              Secure access for compliance teams
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-tight">
              Welcome back to your trust workspace.
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              Sign in to manage controls, evidence, risks, vendors, and trust
              reporting from one focused operating system.
            </p>

            <div className="mt-7 space-y-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3 text-slate-200">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            </div>
          </div>

          <div className="relative rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur [@media(max-height:760px)]:hidden">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald-300" size={24} />
              <div>
                <p className="font-bold">Protected product access</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Public visitors can view testimonials. Authorized users can enter the dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-6 py-10 text-slate-950 dark:bg-slate-950 dark:text-white lg:px-12">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-primary dark:text-slate-300"
            >
              <ArrowLeft size={17} />
              Back to homepage
            </Link>

            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                <LockKeyhole size={24} />
              </div>
              <h2 className="text-4xl font-bold">Sign in</h2>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                Use your work email or continue with Google to access SpectraMind.
              </p>
            </div>

            <div className="mb-5">
              {googleClientId ? (
                <div ref={googleButtonRef} className="min-h-11" />
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleFallback}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-sm font-bold">
                    G
                  </span>
                  Continue with Google
                </button>
              )}

              {googleStatus && (
                <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  {googleStatus}
                </p>
              )}
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-sm font-semibold text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Work email
                </span>
                <input
                  type="email"
                  placeholder="you@company.com"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Password
                </span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
                />
              </label>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                  Remember me
                </label>
                <button type="button" className="font-semibold text-primary hover:text-blue-700">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Sign In
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Need access? Contact your SpectraMind administrator.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function decodeJwt(token) {
  const payload = token.split(".")[1];
  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(normalizedPayload)
      .split("")
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join("")
  );

  return JSON.parse(json);
}
