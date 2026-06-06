"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "react-hot-toast";

const roles = [
  { id: "farmer", label: "Farmer", icon: "👨‍🌾" },
  { id: "buyer", label: "Buyer", icon: "🛒" },
  { id: "expert", label: "Agricultural Expert", icon: "🎓" },
  { id: "lgu", label: "LGU Officer", icon: "🏛️" },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
        isApproved: role === "lgu" ? false : true, // LGU requires manual approval
      });

      toast.success("Account created successfully!");
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')] bg-cover bg-center px-4 py-12">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      <Card className="glass relative w-full max-w-lg border-white/20 animate-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-white">Create Account</CardTitle>
          <CardDescription className="text-white/80">
            Join the local economic support system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/50"
              />
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
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-white">Select Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-all ${
                      role === r.id
                        ? "bg-accent border-accent text-accent-foreground shadow-lg scale-105"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <span className="text-2xl mb-1">{r.icon}</span>
                    <span className="text-sm font-semibold">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-lg"
              isLoading={loading}
              variant="accent"
            >
              Register Account
            </Button>

            <p className="text-center text-sm text-white/70">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-white hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
