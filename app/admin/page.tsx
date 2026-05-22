'use client';

import { useEffect, useState } from 'react';
import AdminDashboard from './dashboard';

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return <AdminDashboard user={{}} />;
}
