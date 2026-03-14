import React, { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Problems from "./pages/problems";
import ProblemDetail from "./pages/problem-detail";
import Leaderboard from "./pages/leaderboard";
import Profile from "./pages/profile";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function GlobalFetchInterceptor() {
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let [resource, config] = args;
      if (typeof resource === "string" && resource.startsWith("/api")) {
        const token = localStorage.getItem("codequest_token");
        if (token) {
          config = config || {};
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      }
      return originalFetch(resource, config);
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
  return null;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/problems" component={Problems} />
        <Route path="/problems/:id" component={ProblemDetail} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalFetchInterceptor />
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
