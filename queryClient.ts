
import { QueryClient } from "@tanstack/react-query";
export async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
}
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  data?: any
) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    const response = await fetch(url, options);
    await throwIfResNotOk(response);
    return response;
  } catch (error) {
    throw error;
  }
}
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}) => async ({ queryKey }: { queryKey: string[] }): Promise<T | undefined> => {
  const [url] = queryKey;
  try {
    const res = await fetch(url);
    if (res.status === 401) {
      if (options.on401 === "returnNull") {
        return undefined;
      } else {
        throw new Error("Unauthorized");
      }
    }
    await throwIfResNotOk(res);
    return res.json() as Promise<T>;
  } catch (error) {
    throw error;
  }
};
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn<any>({ on401: "throw" }),
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});