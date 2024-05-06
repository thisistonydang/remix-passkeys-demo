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

  const existingUser = await db.user.findUnique({
    where: { email: email.toLocaleLowerCase() },
  });
  if (existingUser) {
    return {
      status: 400,
      message: "This email is already registered. Please login instead.",
    };
  }

  const newUser = await db.user.create({
    data: {
      email,
    },
  });

  const headers = await createUserSession(newUser.id);
  return redirect("/", { headers });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);
  if (session) return redirect("/");

  return {};
}

export default function Register() {
  const actionData = useActionData<typeof action>();

  return (
    <>
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
            required
          />
        </label>

        <button className="btn btn-accent">Register a Passkey</button>
      </Form>

      {actionData && actionData.message && (
        <p className="text-sm text-red-500 p-2">{actionData.message}</p>
      )}
    </>
  );
}
