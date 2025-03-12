import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

const formSchema = z.object({
  username: z.string().min(1, {
    message: "Это обязательное поле",
  }),
  password: z.string().min(1, {
    message: "Это обязательное поле",
  }),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { username, password } = values;
    try {
      const data = await login(username, password);
      console.log(data);
      toast.success("Успешная авторизация", {
        duration: 1000,
      });
    } catch (err) {
      // @ts-expect-error
      toast.error(err.response.data.detail, {
        duration: 1000,
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <Card className="py-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Вход в систему
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center">
              Введите ваши учетные данные для входа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-muted-foreground">
                    Имя пользователя
                  </Label>
                  <Input id="username" {...form.register("username")} />
                  {form.formState.errors.username && (
                    <p className="text-destructive text-sm font-medium">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-muted-foreground">
                      Пароль
                    </Label>
                    <a
                      href="#"
                      className="text-sm hover:opacity-90"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      Забыли пароль?
                    </a>
                  </div>
                  <Input id="password" {...form.register("password")} />
                  {form.formState.errors.password && (
                    <p className="text-destructive text-sm font-medium">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Выполняется вход...
                    </>
                  ) : (
                    "Войти"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
