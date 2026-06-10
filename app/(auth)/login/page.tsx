"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      toast.success("Welcome back!");
      router.push("/"); // Will redirect based on role in root layout or middleware
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')] bg-cover bg-center px-4 py-12">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      <Card className="glass relative w-full max-w-md border-white/20 animate-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
            <span className="text-3xl">🌾</span>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white">Welcome Back</CardTitle>
          <CardDescription className="text-white/80">
            Sign in to your farm system account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/50"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/50"
            />
            
            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-white/80 hover:text-white"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full text-lg"
              isLoading={loading}
              variant="accent"
            >
              Sign In
            </Button>

            <p className="text-center text-sm text-white/70">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-white hover:underline">
                Register now
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
