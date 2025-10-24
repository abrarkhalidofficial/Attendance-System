import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../contexts/DataContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { LogIn, UserPlus } from "lucide-react";

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const { settings } = useData();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    name: "",
    department: "",
    position: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(loginEmail, loginPassword);
    if (success) {
      toast.success("Logged in successfully!");
    } else {
      toast.error("Invalid credentials or account is inactive");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register({
      ...registerData,
      role: "employee",
      isActive: true,
      locationOptIn: false,
    });
    if (success) {
      toast.success("Account created! Please log in.");
      setRegisterData({
        email: "",
        password: "",
        name: "",
        department: "",
        position: "",
      });
    } else {
      toast.error("Email already exists");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Time Tracking System</CardTitle>
          <CardDescription>
            Manage attendance, leave, and projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              {settings.allowSelfRegistration && (
                <TabsTrigger value="register">Register</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="email@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Button>
              </form>
            </TabsContent>

            {settings.allowSelfRegistration && (
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      placeholder="John Doe"
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="email@company.com"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-department">Department</Label>
                    <Input
                      id="register-department"
                      placeholder="Engineering"
                      value={registerData.department}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          department: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-position">Position</Label>
                    <Input
                      id="register-position"
                      placeholder="Software Developer"
                      value={registerData.position}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          position: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
