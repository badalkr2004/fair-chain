import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt with:", { email, password });
  };

<div className="min-h-screen flex items-center justify-center bg-gray-50">
<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
  <div className="text-center">
    <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome Back</h2>
    <p className="mt-2 text-sm text-gray-600">
      Please Login in to your account
    </p>
  </div>
  <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
    <div className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-gray-700">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          placeholder="Enter your email"
        />
      </div>
      <div>
        <Label htmlFor="password" className="text-gray-700">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          placeholder="Enter your password"
        />
      </div>
    </div>

    <div>
      <Button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
      >
        Login
      </Button>
    </div>
  </form>
</div>
</div>
  }