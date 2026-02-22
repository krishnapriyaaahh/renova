import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AuthWrap, Field, PwStrength } from "../components/AuthComponents";

export function LoginPage({ navigate, onLoginSuccess, goBack, canGoBack }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pw) return;
    setError("");
    setLoading(true);
    try {
      await login({ email, password: pw });
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    }
    setLoading(false);
  };

  return (
    <AuthWrap
      title="Welcome back."
      sub="Continue your career comeback."
      navigate={navigate}
      goBack={goBack}
      canGoBack={canGoBack}
      altText="No account?"
      altAction="signup"
      altLabel="Join Renova"
    >
      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
      <Field label="Password" type="password" value={pw} onChange={setPw} placeholder="Your password" />
      {error && <p style={{ color: "#d32f2f", fontSize: 13, marginBottom: 8 }}>{error}</p>}
      <button className="btn-primary" style={{ width: "100%", borderRadius: 3, marginTop: 6, opacity: loading ? 0.6 : 1 }} onClick={handleLogin} disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </AuthWrap>
  );
}

export function SignupPage({ navigate, onSignupSuccess, goBack, canGoBack }) {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !pw) return;
    if (pw.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError("");
    setLoading(true);
    try {
      await signup({ name, email, password: pw });
      if (onSignupSuccess) onSignupSuccess();
    } catch (err) {
      setError(err.message || "Signup failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <AuthWrap
      title="Begin your comeback."
      sub="Free forever. No credit card."
      navigate={navigate}
      goBack={goBack}
      canGoBack={canGoBack}
      altText="Already have an account?"
      altAction="login"
      altLabel="Sign in"
    >
      <Field label="Your Name" value={name} onChange={setName} placeholder="First name" />
      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
      <Field label="Password" type="password" value={pw} onChange={setPw} placeholder="Minimum 6 characters" />
      <PwStrength pw={pw} />
      {error && <p style={{ color: "#d32f2f", fontSize: 13, marginBottom: 8 }}>{error}</p>}
      <button className="btn-primary" style={{ width: "100%", borderRadius: 3, opacity: loading ? 0.6 : 1 }} onClick={handleSignup} disabled={loading}>
        {loading ? "Creating account..." : "Create My Account"}
      </button>
      <p style={{ fontSize: 12, color: "#9d6b82", marginTop: 16, lineHeight: 1.6 }}>By joining, you agree to our Terms and Privacy Policy.</p>
    </AuthWrap>
  );
}

