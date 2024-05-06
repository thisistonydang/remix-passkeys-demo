import { redirect } from "@remix-run/node";

import { useCurrentUser } from "~/hooks/useCurrentUser";
import { getUserSession } from "~/modules/session/session.server";

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Remix Passkeys Demo" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);
  if (!session) return redirect("/login");

  return {};
}

export default function Index() {
  const currentUser = useCurrentUser();

  return (
    <h1 className="text-2xl font-bold">
      Hi {currentUser?.email}, you are logged in!
    </h1>
  );
}
