import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";

interface AuthFormProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
}

interface PasswordStrength {
  score: number; // 0-4
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

  // Regras de validação de senha
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

  // Calcula a força da senha
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

  // Valida email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação do formulário
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
      // Validações extras para cadastro
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
      // Validação mínima para login
      if (password.length < 6) {
        return "Password must be at least 6 characters";
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    // Validação do formulário
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            My Notes
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-3 sm:space-y-4"
        >
          {/* Email */}
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

          {/* Password */}
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

            {/* Indicador de força da senha (apenas no cadastro) */}
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

          {/* Confirm Password (apenas no cadastro) */}
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

          {/* Requisitos de senha (apenas no cadastro quando focado) */}
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
            className="w-full bg-purple-600 text-white py-2 sm:py-2.5 rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors font-medium disabled:bg-purple-400 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-5 sm:mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={loading}
            className="text-purple-600 hover:text-purple-700 active:text-purple-800 text-xs sm:text-sm font-medium disabled:text-purple-400 transition-colors"
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