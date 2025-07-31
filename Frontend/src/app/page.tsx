'use client';

import Button from '@/components/Button';
import Card from '@/components/Card';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isClient, setIsClient] = useState(false); // Used in conditional rendering to prevent hydration mismatch

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        router.replace('/homescreen');
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [router]);

  // Show loading while checking authentication (only on client)
  if (!isClient || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-yellow-300 border-t-yellow-600 rounded-full animate-spin"></div>
          <p className="text-yellow-800 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 p-8 relative">
      {/* Top-right Login Button */}
      <div className="absolute top-6 right-6">
        <Link href="/login">
          <Button variant="primary" className="py-2 px-6 font-bold flex items-center gap-2">
          <span className="inline-block w-4 h-4 bg-yellow-700 rounded-full mr-2"></span>
          Login
          </Button>
        </Link>
      </div>
      {/* Door Illustration with Animation */}
      <div className="w-32 h-56 bg-gradient-to-b from-yellow-300 to-orange-200 rounded-2xl border-8 border-yellow-600 flex flex-col items-center justify-end mb-8 relative shadow-xl animate-bounce-slow">
        <div className="w-8 h-8 bg-yellow-600 rounded-full absolute left-4 bottom-16"></div>
        <div className="w-12 h-3 bg-yellow-700 rounded-b-lg mb-1"></div>
      </div>
      {/* Animated Welcome Message */}
      <Card className="bg-transparent shadow-none text-center flex flex-col items-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 drop-shadow-lg animate-fade-in bg-gradient-to-r from-yellow-700 via-orange-500 to-yellow-700 bg-clip-text text-transparent">
        Welcome to Timber 5D Business Solutions
      </h1>
        <p className="text-xl sm:text-2xl text-yellow-800 mb-8 max-w-2xl animate-fade-in delay-200 font-medium">
        Unlock new opportunities and elevate your business with innovative, timber-inspired solutions. Step through the door to a brighter, more sustainable future.
      </p>
      </Card>
      <div className="flex gap-6 flex-col sm:flex-row w-full max-w-xs justify-center">
        {/* (Optional) Add more buttons here if needed */}
      </div>
      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s ease-out;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}
