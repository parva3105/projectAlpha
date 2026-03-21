import { NextResponse } from 'next/server'

type ApiResponse<T> = { data: T; error: null } | { data: null; error: string }

export const ok = <T>(data: T, s = 200) =>
  NextResponse.json<ApiResponse<T>>({ data, error: null }, { status: s })

export const created = <T>(data: T) => ok(data, 201)

export const err = (msg: string, s = 400) =>
  NextResponse.json<ApiResponse<never>>({ data: null, error: msg }, { status: s })

export const badRequest    = (m = 'Bad request')  => err(m, 400)
export const unauthorized  = (m = 'Unauthorized')  => err(m, 401)
export const forbidden     = (m = 'Forbidden')     => err(m, 403)
export const notFound      = (m = 'Not found')     => err(m, 404)
export const unprocessable = (m: string)           => err(m, 422)
