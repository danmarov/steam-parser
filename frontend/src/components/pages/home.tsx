import { useAuthStore } from "@/store/auth-store";
import { Link } from "react-router";
import { Button } from "../ui/button";

export default function Home() {
  const { isAuthenticated, user, logout } = useAuthStore();
  return (
    <div>
      {isAuthenticated ? (
        <>
          Привет,{user?.username} <br />
          {JSON.stringify(user)}
        </>
      ) : (
        <>Авторизируйтесь</>
      )}
      <br />
      {isAuthenticated ? (
        <>
          <Link to={"/secret"}>To secret page</Link>
          <br />
          <Button onClick={logout} className="mt-2">
            Logout
          </Button>
        </>
      ) : (
        <Link to={"/login"}>Login</Link>
      )}
      <br />
    </div>
  );
}
