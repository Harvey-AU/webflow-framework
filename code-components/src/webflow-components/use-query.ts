import { useFunction, useSuspenseData } from "@webflow/react";
import type { EmptyParams, FunctionRef } from "@webflow/functions";
import type { JsonSerializable } from "@webflow/data-types";

/**
 * Run a query at a component's call site.
 *
 * This is the only place in the library that knows a Code Function exists. A
 * declaration wraps its UI component in three lines - call this, hand the
 * result down as props - and the component itself stays a function of its
 * props, renderable in Storybook, a test, or a different host entirely.
 *
 * With `ssr: "prerender"` on the declaration, the read resolves before first
 * paint and the data ships inside the served HTML.
 *
 * `fallback` is what to render with when the read resolves to nothing. It is a
 * parameter rather than a default inside a component so every default for the
 * site lives in `src/config/site.ts`.
 */
export function useQuery<T>(key: string, fn: FunctionRef<EmptyParams, T>, fallback: T): T {
  const call = useFunction(fn);
  const { data } = useSuspenseData<T>(key, () => call() as Promise<T & JsonSerializable<T>>);
  // The hook's type says `data` is always there; a function that resolved to
  // null would still hand us undefined, and that must not blank the page.
  return (data as T | undefined) ?? fallback;
}
