import AuthProvider from "./auth-provider";
import BasicRoute from "./basic-route";
import PrivateRoute from "./private-route";
import PublicRoute from "./public-route";

const Auth = {
  Provider: (props: any) => <AuthProvider {...props} />,
  Basic: (props: any) => <BasicRoute {...props} />,
  Private: (props: any) => <PrivateRoute {...props} />,
  Public: (props: any) => <PublicRoute {...props} />,
};

export default Auth;
