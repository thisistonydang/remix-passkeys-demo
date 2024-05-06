import { useRouteLoaderData } from "@remix-run/react";

import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "~/root";

export function useCurrentUser() {
  const data = useRouteLoaderData("root") as
    | SerializeFrom<typeof loader>
    | undefined;

  return data?.currentUser;
}
