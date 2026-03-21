import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Lazy singletons — Redis.fromEnv() throws at module load if env vars are absent,
// which crashes next build in CI before the secrets are provisioned.
let _redis: Redis | null = null
function getRedis(): Redis {
  if (!_redis) _redis = Redis.fromEnv()
  return _redis
}

let _authRateLimit: Ratelimit | null = null
export function getAuthRateLimit(): Ratelimit {
  if (!_authRateLimit) {
    _authRateLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      prefix: 'auth',
    })
  }
  return _authRateLimit
}

let _uploadRateLimit: Ratelimit | null = null
export function getUploadRateLimit(): Ratelimit {
  if (!_uploadRateLimit) {
    _uploadRateLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      prefix: 'upload',
    })
  }
  return _uploadRateLimit
}
