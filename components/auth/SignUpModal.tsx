"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X, Mail, Lock, User } from "lucide-react";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export function SignUpModal({ isOpen, onClose, onSwitchToSignIn }: SignUpModalProps) {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const passwordRegex = /^.{8,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordRegex.test(formData.password)) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.name);
      toast.success("Account created. Please verify your email.");
      onClose();
      router.push("/");
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already registered. Please sign in instead.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address.");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Please use a stronger password.");
      } else {
        toast.error(error.message || "Failed to create account. Please try again.");
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

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed up with Google successfully!");
      onClose();
      router.push("/");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error(error.message || "Google sign up failed. Please try again.");
      }
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
      <div className="onjean-themed-scrollbar relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-500">Join us for exclusive benefits</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={loading}
                className="pl-11 h-12 bg-gray-50 border-gray-200 text-black placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>

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
                minLength={8}
                pattern="^.{8,}$"
                title="Password must be at least 8 characters long"
                className="pl-11 h-12 bg-gray-50 border-gray-200 text-black placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                minLength={8}
                pattern="^.{8,}$"
                title="Password must be at least 8 characters long"
                className="pl-11 h-12 bg-gray-50 border-gray-200 text-black placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-white font-semibold rounded-lg shadow-lg"
            style={{ backgroundColor: '#101828' }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>

          <Button
            type="button"
            onClick={handleGoogleSignUp}
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
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-amber-600 hover:text-amber-700 font-semibold"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
