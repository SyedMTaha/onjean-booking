"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X, Mail, Lock } from "lucide-react";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export function SignInModal({ isOpen, onClose, onSwitchToSignUp }: SignInModalProps) {
  const router = useRouter();
  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      toast.success("Signed in successfully!");
      onClose();
      router.push("/");
    } catch (error: any) {
      console.error("Sign in error:", error);
      
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address.");
      } else if (error.code === "auth/invalid-credential") {
        toast.error("Invalid email or password.");
      } else {
        toast.error(error.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google successfully!");
      onClose();
      router.push("/");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error(error.message || "Google sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      toast.error("Please enter your email first to reset password.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(formData.email.trim());
      toast.success("Password reset email sent.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const GoogleLogo = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.805 12.227c0-.818-.073-1.604-.209-2.364H12v4.473h5.487a4.693 4.693 0 0 1-2.034 3.082v2.559h3.291c1.926-1.773 3.061-4.389 3.061-7.75Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.754 0 5.066-.913 6.754-2.473l-3.291-2.559c-.913.613-2.082.975-3.463.975-2.662 0-4.918-1.798-5.723-4.213H2.875v2.64A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.277 13.73A6.01 6.01 0 0 1 5.957 12c0-.6.108-1.182.32-1.73V7.63H2.875A10 10 0 0 0 2 12c0 1.61.386 3.133 1.075 4.37l3.202-2.64Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.058c1.498 0 2.845.515 3.905 1.526l2.927-2.927C17.06 2.985 14.748 2 12 2A10 10 0 0 0 3.075 7.63l3.202 2.64c.805-2.415 3.061-4.213 5.723-4.213Z"
      />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={loading}
                className="pl-11 h-12 bg-gray-50 border-gray-200 text-black placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className="pl-11 h-12 bg-gray-50 border-gray-200 text-black placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-white font-semibold rounded-lg shadow-lg"
            style={{ backgroundColor: '#101828' }}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 text-white font-semibold rounded-lg shadow-lg"
            style={{ backgroundColor: "#101828" }}
          >
            <GoogleLogo />
            Continue with Google
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-amber-600 hover:text-amber-700 font-semibold"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
