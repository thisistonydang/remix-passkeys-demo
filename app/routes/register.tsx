import { redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { db } from "~/modules/database/db.server";
import {
  createUserSession,
  getUserSession,
} from "~/modules/session/session.server";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";


export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);
  if (session) return redirect("/");

  return {};
}

