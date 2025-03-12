import { Link } from "react-router";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/auth-store";

export default function Secret() {
  const { logout } = useAuthStore();
  return (
    <div>
      Super Secret Page
      <div className="space-x-5 mt-5">
        <Button asChild>
          <Link to={"/"}>Go home</Link>
        </Button>
        <Button onClick={logout} variant={"secondary"}>
          Logout
        </Button>
      </div>
    </div>
  );
}
