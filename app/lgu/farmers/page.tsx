"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

interface Farmer {
  uid: string;
  name: string;
  barangay: string;
  email: string;
  role: string;
  isApproved: boolean;
}

export default function FarmerDirectory() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "farmer"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as Farmer));
      setFarmers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.barangay?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <header className="glass sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/lgu/dashboard" className="mr-4 text-xl">🏛️</Link>
          <span className="font-bold text-primary text-xl">Farmer Directory</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex-1 max-w-md">
            <Input 
              placeholder="Search by name or barangay..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline">Filter by Barangay</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-4 font-bold">Name</th>
                      <th className="px-6 py-4 font-bold">Barangay</th>
                      <th className="px-6 py-4 font-bold">Contact</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFarmers.map((farmer) => (
                      <tr key={farmer.uid} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold">{farmer.name}</td>
                        <td className="px-6 py-4">{farmer.barangay || "Not Specified"}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{farmer.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">
                            Registered
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="outline" size="sm">View Profile</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
