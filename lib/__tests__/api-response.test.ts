import { describe, it, expect } from 'vitest'
import { ok, created, err, badRequest, unauthorized, forbidden, notFound, unprocessable } from '@/lib/api-response'

describe('ok', () => {
  it('returns 200 with data', async () => {
    const res = ok({ id: '1', name: 'Test' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toEqual({ id: '1', name: 'Test' })
    expect(body.error).toBeNull()
  })

  it('accepts a custom status code', async () => {
    const res = ok('accepted', 202)
    expect(res.status).toBe(202)
  })
})

describe('created', () => {
  it('returns 201 with data', async () => {
    const res = created({ id: 'new' })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data).toEqual({ id: 'new' })
    expect(body.error).toBeNull()
  })
})

describe('err', () => {
  it('returns the given status and error message', async () => {
    const res = err('Something went wrong', 500)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.data).toBeNull()
    expect(body.error).toBe('Something went wrong')
  })
})

describe('badRequest', () => {
  it('returns 400', async () => {
    const res = badRequest('Invalid input')
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Invalid input')
  })

  it('uses default message', async () => {
    const res = badRequest()
    const body = await res.json()
    expect(body.error).toBe('Bad request')
  })
})

describe('unauthorized', () => {
  it('returns 401', async () => {
    const res = unauthorized()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })
})

describe('forbidden', () => {
  it('returns 403', async () => {
    const res = forbidden()
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Forbidden')
  })
})

describe('notFound', () => {
  it('returns 404', async () => {
    const res = notFound()
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Not found')
  })
})

describe('unprocessable', () => {
  it('returns 422', async () => {
    const res = unprocessable('validation failed')
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.error).toBe('validation failed')
  })
})
