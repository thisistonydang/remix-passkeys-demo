import { redirect } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import { startAuthentication } from "@simplewebauthn/browser";
import { useState } from "react";

import { db } from "~/modules/database/db.server";
import {
  createUserSession,
  getUserSession,
} from "~/modules/session/session.server";
import { verifyPasskeyAuthenticationResponse } from "~/modules/session/webauthn.server";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { FormEvent } from "react";

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = form.get("email");
  const authenticationResponseJson = form.get("authenticationResponseJson");

  if (
    typeof authenticationResponseJson !== "string" ||
    typeof email !== "string"
  ) {
    return {
      status: 400,
      message: "Invalid form data.",
    };
  }

  const user = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { authenticators: true },
  });
  if (!user) {
    return {
      status: 400,
      message: "No user found with this email. Please register instead.",
    };
  }

  try {
    const authenticationResponse = JSON.parse(authenticationResponseJson);
    const { verified } = await verifyPasskeyAuthenticationResponse(
      user,
      authenticationResponse
    );
    if (verified) {
      const headers = await createUserSession(user.id);
      return redirect("/", { headers });
    }

    return {
      status: 400,
      message: "Sign in with passkey failed.",
    };
  } catch {
    return {
      status: 400,
      message: "Sign in with passkey failed.",
    };
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);
  if (session) return redirect("/");

  return {};
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const [email, setEmail] = useState("");
  const [processingPasskey, setProcessingPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");

  async function handleSignInWithPasskey(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProcessingPasskey(true);
    setPasskeyError("");

    try {
      const resp = await fetch("/generate-authentication-options", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const options = await resp.json();
      if (!options) {
        setPasskeyError("No passkeys exists for this account.");
        return;
      }

      const authenticationResponse = await startAuthentication(options);
      submit(
        {
          authenticationResponseJson: JSON.stringify(authenticationResponse),
          email,
        },
        { method: "POST" }
      );
    } catch {
      setPasskeyError("Failed to sign in with passkey.");
    } finally {
      setProcessingPasskey(false);
    }
  }

  return (
    <>
      <h1 className="font-bold text-4xl mb-3">Login</h1>

      <form
        onSubmit={handleSignInWithPasskey}
        method="POST"
        className="border border-neutral rounded-lg p-5 flex flex-col gap-3 mx-auto max-w-xs"
      >
        <label className="form-control w-full max-w-xs">
          <span className="label-text mb-2">Enter your email</span>

          <input
            className="input input-bordered"
            id="email"
            type="email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <button className="btn btn-accent" disabled={processingPasskey}>
          {processingPasskey ? "Signing in..." : "Sign in with Passkey"}
        </button>

        {passkeyError && <p className="text-red-500">{passkeyError}</p>}
        {actionData && "passkeyError" in actionData && (
          <p className="text-red-500">{actionData.message}</p>
        )}
      </form>

      {actionData && actionData.message && (
        <p className="text-sm text-red-500 p-2">{actionData.message}</p>
      )}
    </>
  );
}
