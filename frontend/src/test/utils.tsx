import { ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProjectProvider } from "@/hooks/useProject";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperProps {
  children: ReactNode;
  initialEntries?: string[];
  path?: string;
}

export function renderWithProviders(
  ui: ReactNode,
  {
    initialEntries = ["/"],
    path = "/",
    queryClient,
    ...options
  }: WrapperProps & { queryClient?: QueryClient } & Omit<RenderOptions, "wrapper"> = {}
) {
  const client = queryClient ?? createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={initialEntries}>
            <AuthProvider>
              <ProjectProvider>
                <Routes>
                  <Route path={path} element={children} />
                </Routes>
              </ProjectProvider>
            </AuthProvider>
          </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export function mockLocalStorage(token = "mock-access-token") {
  localStorage.setItem("access_token", token);
  localStorage.setItem("refresh_token", "mock-refresh-token");
}

export function clearLocalStorage() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}
