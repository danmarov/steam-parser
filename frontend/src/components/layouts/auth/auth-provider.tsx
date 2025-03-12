import { useAuthStore } from "@/store/auth-store";
import { PropsWithChildren, useEffect } from "react";

const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
};

export default AuthProvider;
