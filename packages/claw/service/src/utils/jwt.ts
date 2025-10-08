import { clawEnvConfig } from '@netko/claw-config'
import { createRemoteJWKSet, jwtVerify } from 'jose'

export async function validateToken(token: string) {
  const Jwks = createRemoteJWKSet(new URL(`${clawEnvConfig.app.baseUrl}/api/auth/jwks`))
  const { payload } = await jwtVerify(token, Jwks, {
    issuer: clawEnvConfig.app.baseUrl,
    audience: clawEnvConfig.app.baseUrl,
  })
  return payload
}
