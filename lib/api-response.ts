import { NextResponse } from "next/server";

type ApiData = Record<string, unknown> | unknown[] | null;

/** Successful response — always `{ data, error: null }` */
export function ok<T extends ApiData>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

/** Error response — always `{ data: null, error: string }` */
export function err(message: string, status: number) {
  return NextResponse.json({ data: null, error: message }, { status });
}

/** 401 Unauthenticated */
export const unauthorized = () => err("Unauthenticated", 401);

/** 403 Forbidden (wrong role) */
export const forbidden = () => err("Forbidden: agency role required", 403);

/** 404 Not Found */
export const notFound = (resource = "Resource") =>
  err(`${resource} not found`, 404);

/** 422 Unprocessable */
export const unprocessable = (message: string) => err(message, 422);

/** 400 Bad Request (validation) */
export const badRequest = (message: string) => err(message, 400);
