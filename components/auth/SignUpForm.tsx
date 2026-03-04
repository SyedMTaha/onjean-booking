"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export function SignUpForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.name);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      // Handle specific Firebase errors
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

  return (
    <div className="w-full max-w-md">
      {/* Logo/Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center mb-4">
          <img 
            src="/logo/logo.jpeg" 
            alt="78 On Jean Logo" 
            className="h-20 w-auto object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600 mt-2">Sign up to start booking</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              disabled={loading}
              className="h-11 bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={loading}
              className="h-11 bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                disabled={loading}
                minLength={6}
                className="h-11 pr-11 bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                disabled={loading}
                minLength={6}
                className="h-11 pr-11 bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-lg shadow-amber-600/20"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/signin" className="text-amber-600 hover:text-amber-700 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
