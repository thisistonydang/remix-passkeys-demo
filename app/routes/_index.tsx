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
import type { VerifiedRegistrationResponse } from "@simplewebauthn/server";
import type { FormEvent } from "react";

export const meta: MetaFunction = () => {
  return [{ title: "Remix Passkeys Demo" }];
};

export async function action({ request }: ActionFunctionArgs): Promise<{
  verification: VerifiedRegistrationResponse | undefined;
}> {
  const session = await getUserSession(request);
  const user = await db.user.findUnique({
    where: { id: session?.userId },
    include: { authenticators: true },
  });
  if (!user) throw redirect("/login");

  const formData = await request.formData();
  const registrationResponseJson = formData.get("registrationResponseJson");
  if (typeof registrationResponseJson !== "string")
    return { verification: { verified: false } };

  try {
    const registrationResponse = JSON.parse(registrationResponseJson);
    const verification = await verifyPasskeyRegistrationResponse(
      user,
      registrationResponse
    );
    return { verification };
  } catch {
    return { verification: { verified: false } };
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);
  const user = await db.user.findUnique({
    where: { id: session?.userId },
    include: { authenticators: true },
  });
  if (!user) throw redirect("/login");

  return {
    options: await getPasskeyRegistrationOptions(user),
  };
}

export default function Index() {
  const { options } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const currentUser = useCurrentUser();

  const submit = useSubmit();

  const [processingPasskey, setProcessingPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");

  return (
    <h1 className="text-2xl font-bold">
      Hi {currentUser?.email}, you are logged in!
    </h1>
  );
}
