// src/components/layouts/public-route.tsx
import Loader from "@/components/common/loader";
import { useAuthStore } from "@/store/auth-store";
import React, { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router";

interface PublicRouteProps extends PropsWithChildren {
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = "/",
}) => {
  const { isAuthenticated, isAuthChecking } = useAuthStore();
  const location = useLocation();

  if (isAuthChecking) {
    return <Loader />;
  }

  if (isAuthenticated) {
    const from = location.state?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
