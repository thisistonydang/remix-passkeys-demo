import { redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { db } from "~/modules/database/db.server";
import {
  createUserSession,
  getUserSession,
} from "~/modules/session/session.server";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = form.get("email");

  if (!email || typeof email !== "string") {
    return {
      status: 400,
      message: "Email is required.",
    };
  }

  const user = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user) {
    return {
      status: 400,
      message: "No user found with this email. Please register instead.",
    };
  }

  const headers = await createUserSession(user.id);
  return redirect("/", { headers });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);
  if (session) return redirect("/");

  return {};
}

export default function Login() {
  const actionData = useActionData<typeof action>();

  return (
    <>
      <h1 className="font-bold text-4xl mb-3">Login</h1>

      <Form
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
          />
        </label>

        <button className="btn btn-accent">Sign in with Passkey</button>
      </Form>

      {actionData && actionData.message && (
        <p className="text-sm text-red-500 p-2">{actionData.message}</p>
      )}
    </>
  );
}
