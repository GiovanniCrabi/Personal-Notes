import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";

interface AuthFormProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  bgColor: string;
}

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
  met?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSignIn, onSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordRules: ValidationRule[] = [
    {
      test: (pwd) => pwd.length >= 8,
      message: "At least 8 characters",
    },
    {
      test: (pwd) => /[A-Z]/.test(pwd),
      message: "One uppercase letter",
    },
    {
      test: (pwd) => /[a-z]/.test(pwd),
      message: "One lowercase letter",
    },
    {
      test: (pwd) => /[0-9]/.test(pwd),
      message: "One number",
    },
    {
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      message: "One special character (!@#$%...)",
    },
  ];

  const getPasswordStrength = (pwd: string): PasswordStrength => {
    if (!pwd) {
      return { score: 0, label: "", color: "", bgColor: "" };
    }

    const metRules = passwordRules.filter((rule) => rule.test(pwd)).length;
    
    if (metRules <= 1) {
      return { score: 1, label: "Very Weak", color: "text-red-600", bgColor: "bg-red-500" };
    } else if (metRules === 2) {
      return { score: 2, label: "Weak", color: "text-orange-600", bgColor: "bg-orange-500" };
    } else if (metRules === 3) {
      return { score: 3, label: "Good", color: "text-yellow-600", bgColor: "bg-yellow-500" };
    } else if (metRules === 4) {
      return { score: 4, label: "Strong", color: "text-green-600", bgColor: "bg-green-500" };
    } else {
      return { score: 5, label: "Very Strong", color: "text-green-700", bgColor: "bg-green-600" };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): string | null => {
    if (!email.trim()) {
      return "Please enter your email";
    }

    if (!isValidEmail(email)) {
      return "Please enter a valid email address";
    }

    if (!password) {
      return "Please enter your password";
    }

    if (isSignUp) {
      if (password.length < 8) {
        return "Password must be at least 8 characters";
      }

      const unmetRules = passwordRules.filter((rule) => !rule.test(password));
      if (unmetRules.length > 0) {
        return `Password must meet all requirements`;
      }

      if (!confirmPassword) {
        return "Please confirm your password";
      }

      if (password !== confirmPassword) {
        return "Passwords do not match";
      }
    } else {
      if (password.length < 6) {
        return "Password must be at least 6 characters";
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await onSignUp(email.trim(), password);
      } else {
        await onSignIn(email.trim(), password);
      }
    } catch (err: unknown) {
      if (err instanceof Error && "code" in err) {
        const firebaseError = err as { code: string };

        if (firebaseError.code === "auth/email-already-in-use") {
          setError("This email is already in use");
        } else if (firebaseError.code === "auth/weak-password") {
          setError("Password is too weak");
        } else if (firebaseError.code === "auth/invalid-email") {
          setError("Invalid email address");
        } else if (
          firebaseError.code === "auth/user-not-found" ||
          firebaseError.code === "auth/wrong-password" ||
          firebaseError.code === "auth/invalid-credential"
        ) {
          setError("Incorrect email or password");
        } else {
          setError("Authentication error. Please try again.");
        }
      } else {
        setError("Unknown authentication error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError(null);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [isSignUp]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
            My Notes
          </h1>
          <p className="text-sm sm:text-base text-gray-700 font-medium">
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-3 sm:space-y-4"
        >
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                disabled={loading}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>

            {isSignUp && password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Password strength:</span>
                  <span className={`text-xs font-medium ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.bgColor} transition-all duration-300`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 transition-colors ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>
          )}

          {isSignUp && (passwordFocused || password) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Password must contain:
              </p>
              <div className="space-y-1.5">
                {passwordRules.map((rule, index) => {
                  const isMet = rule.test(password);
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        isMet ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {isMet ? (
                        <Check className="w-3 h-3 shrink-0" />
                      ) : (
                        <X className="w-3 h-3 shrink-0" />
                      )}
                      <span>{rule.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-smooth font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Loading...
              </span>
            ) : (
              isSignUp ? "Create Account" : "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={loading}
            className="text-indigo-600 hover:text-indigo-700 active:text-indigo-800 text-sm font-semibold disabled:opacity-50 transition-smooth"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};