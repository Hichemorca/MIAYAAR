import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError, type TRPCDefaultErrorShape } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

/**
 * Removes server-internal stack diagnostics from every tRPC client response.
 * Local development diagnostics remain available through adapter error logging.
 */
export function redactPublicErrorStack(
  shape: TRPCDefaultErrorShape
): TRPCDefaultErrorShape {
  const { stack: _stack, ...safeData } = shape.data;
  return { ...shape, data: safeData };
}

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return redactPublicErrorStack(shape);
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
);
