import { clawEnvConfig } from '@covenote/claw-config'
import { createRemoteJWKSet, jwtVerify } from 'jose'

export async function validateToken(token: string) {
  const jwks = createRemoteJWKSet(new URL(`${clawEnvConfig.app.baseUrl}/api/auth/jwks`))
  const { payload } = await jwtVerify(token, jwks, {
    issuer: clawEnvConfig.app.baseUrl,
    audience: clawEnvConfig.app.baseUrl,
  })
  return payload
}
