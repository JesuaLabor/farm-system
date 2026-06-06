"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && profile) {
      // Redirect based on role
      switch (profile.role) {
        case "farmer":
          router.push("/farmer/dashboard");
          break;
        case "buyer":
          router.push("/buyer/browse");
          break;
        case "lgu":
          router.push("/lgu/dashboard");
          break;
        case "expert":
          router.push("/expert/forum");
          break;
        case "admin":
          router.push("/admin/dashboard");
          break;
      }
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌾</span>
            <span className="text-xl font-bold text-primary">FarmSystem</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
              Empowering <span className="text-primary">Local Farmers</span>, Connecting Communities.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              A digital platform designed to eliminate middlemen, provide fair prices, 
              and streamline government support for the local agricultural economy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">Join as a Farmer</Button>
              </Link>
              <Link href="/buyer/browse">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">Browse Produce</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything You Need to Thrive</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides comprehensive tools for farmers, buyers, and agricultural officers.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🛒" 
              title="Direct Marketplace" 
              description="Sell your produce directly to consumers at fair market prices without middlemen."
            />
            <FeatureCard 
              icon="📈" 
              title="Price Monitoring" 
              description="Stay updated with real-time market trends and crop values across the region."
            />
            <FeatureCard 
              icon="📋" 
              title="Government Aid" 
              description="Apply for subsidies, loans, and agricultural programs directly through the platform."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t bg-card">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl">🌾</span>
            <span className="text-xl font-bold text-primary">FarmSystem</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 FarmSystem. Supporting local agriculture for a sustainable future.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
