import Loader from "@/components/common/loader";
import { useAuthStore } from "@/store/auth-store";
import React, { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router";

interface PrivateRouteProps extends PropsWithChildren {
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  redirectTo = "/login",
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
