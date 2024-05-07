import {
  Form,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css?url";

import { useCurrentUser } from "./hooks/useCurrentUser";
import { getCurrentUser } from "./modules/session/session.server";

import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export async function loader({ request }: LoaderFunctionArgs) {
  return {
    currentUser: await getCurrentUser(request),
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const currentUser = useCurrentUser();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="navbar bg-base-100 max-w-3xl mx-auto">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl" href="/">
              Remix Passkeys Demo
            </a>
          </div>

          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              {currentUser ? (
                <li>
                  <Form method="POST" action="/logout">
                    <button>logout</button>
                  </Form>
                </li>
              ) : (
                <>
                  <li>
                    <a href="/login">login</a>
                  </li>
                  <li>
                    <a href="/register">register</a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-xs my-10">{children}</div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
