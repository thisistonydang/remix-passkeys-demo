import { redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { startRegistration } from "@simplewebauthn/browser";
import { useState } from "react";

import { useCurrentUser } from "~/hooks/useCurrentUser";
import { db } from "~/modules/database/db.server";
import { getUserSession } from "~/modules/session/session.server";
import {
  getPasskeyRegistrationOptions,
  verifyPasskeyRegistrationResponse,
} from "~/modules/session/webauthn.server";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import type { FormEvent } from "react";

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
