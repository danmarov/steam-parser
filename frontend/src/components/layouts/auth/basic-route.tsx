import Loader from "@/components/common/loader";
import { useAuthStore } from "@/store/auth-store";
import React, { PropsWithChildren } from "react";

interface BasicRouteProps extends PropsWithChildren {
  redirectTo?: string;
}

const BasicRoute: React.FC<BasicRouteProps> = ({ children }) => {
  const { isLoading } = useAuthStore();

  if (isLoading) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default BasicRoute;
