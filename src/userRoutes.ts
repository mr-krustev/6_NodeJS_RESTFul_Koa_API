import Router from "@koa/router";
import { User, userSchema } from "./userSchema";
import crypto from "crypto";
import { DefaultContext, DefaultState, ParameterizedContext } from "koa";

const inMemoryUsers: (User & { id: string })[] = [];

const router = new Router({
  prefix: "/users",
});

router.get("/", (ctx) => {
  ctx.body = inMemoryUsers;
});

router.post(
  "/",
  (
    ctx: ParameterizedContext<
      DefaultState,
      DefaultContext,
      User | { error: string; details: { field: string; message: string }[] }
    >
  ) => {
    const newUser = userSchema.safeParse(ctx.request.body);

    if (!newUser.success) {
      ctx.status = 400;
      ctx.body = {
        error: "Invalid user data",
        details: newUser.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      };
      return;
    }

    inMemoryUsers.push({ ...newUser.data, id: crypto.randomUUID() });

    ctx.body = newUser.data;
  }
);

export const userRoutes = router;
