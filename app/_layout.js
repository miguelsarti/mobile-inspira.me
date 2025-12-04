import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import Splash from "./splash";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  
  if (loading) {
    return <Splash />;
  }

  
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
