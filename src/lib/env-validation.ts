interface EnvironmentCheck {
  name: string
  required: boolean
  description: string
  value?: string
  status: 'ok' | 'missing' | 'invalid'
  suggestion?: string
}

export function validateEnvironment(): EnvironmentCheck[] {
  const checks: EnvironmentCheck[] = []

  // Database URL validation
  const databaseUrl = process.env.DATABASE_URL
  checks.push({
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL database connection string',
    value: databaseUrl ? databaseUrl.replace(/\/\/.*:.*@/, '//***:***@') : undefined,
    status: databaseUrl ? 
      (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://') ? 'ok' : 'invalid') : 
      'missing',
    suggestion: !databaseUrl ? 
      'Set DATABASE_URL to your PostgreSQL connection string (e.g., postgresql://user:password@host:5432/database)' :
      (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) ?
      'DATABASE_URL should start with postgresql:// or postgres://' : undefined
  })

  // NextAuth Secret validation
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  checks.push({
    name: 'NEXTAUTH_SECRET',
    required: true,
    description: 'Secret key for NextAuth.js JWT signing',
    value: nextAuthSecret ? `***${nextAuthSecret.slice(-4)}` : undefined,
    status: nextAuthSecret ? 
      (nextAuthSecret.length >= 32 ? 'ok' : 'invalid') : 
      'missing',
    suggestion: !nextAuthSecret ? 
      'Set NEXTAUTH_SECRET to a random string (at least 32 characters). Generate with: openssl rand -base64 32' :
      nextAuthSecret.length < 32 ?
      'NEXTAUTH_SECRET should be at least 32 characters long for security' : undefined
  })

  // NextAuth URL validation
  const nextAuthUrl = process.env.NEXTAUTH_URL
  checks.push({
    name: 'NEXTAUTH_URL',
    required: process.env.NODE_ENV === 'production',
    description: 'Base URL for NextAuth.js (required in production)',
    value: nextAuthUrl,
    status: nextAuthUrl ? 
      (nextAuthUrl.startsWith('http://') || nextAuthUrl.startsWith('https://') ? 'ok' : 'invalid') : 
      (process.env.NODE_ENV === 'production' ? 'missing' : 'ok'),
    suggestion: !nextAuthUrl && process.env.NODE_ENV === 'production' ? 
      'Set NEXTAUTH_URL to your app\'s base URL (e.g., https://yourdomain.com)' :
      nextAuthUrl && !nextAuthUrl.startsWith('http') ?
      'NEXTAUTH_URL should include the protocol (http:// or https://)' : undefined
  })

  // Node Environment validation
  const nodeEnv = process.env.NODE_ENV
  checks.push({
    name: 'NODE_ENV',
    required: true,
    description: 'Node.js environment mode',
    value: nodeEnv,
    status: nodeEnv && ['development', 'production', 'test'].includes(nodeEnv) ? 'ok' : 'invalid',
    suggestion: !nodeEnv || !['development', 'production', 'test'].includes(nodeEnv) ?
      'Set NODE_ENV to development, production, or test' : undefined
  })

  // Platform detection
  const platform = process.env.VERCEL ? 'Vercel' : 
                  process.env.NETLIFY ? 'Netlify' : 
                  process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 
                  process.env.RENDER ? 'Render' : 
                  'Unknown'

  checks.push({
    name: 'PLATFORM',
    required: false,
    description: 'Detected hosting platform',
    value: platform,
    status: 'ok'
  })

  return checks
}

export function getEnvironmentSummary() {
  const checks = validateEnvironment()
  const missing = checks.filter(c => c.status === 'missing' && c.required)
  const invalid = checks.filter(c => c.status === 'invalid')
  const warnings = checks.filter(c => c.suggestion)

  return {
    isValid: missing.length === 0 && invalid.length === 0,
    missing: missing.map(c => c.name),
    invalid: invalid.map(c => c.name),
    warnings: warnings.map(c => ({ name: c.name, suggestion: c.suggestion })),
    checks
  }
}

export function generateEnvironmentSetupInstructions(platform?: string) {
  const summary = getEnvironmentSummary()
  if (summary.isValid) return null

  const instructions = ['Environment Setup Instructions:']
  
  if (summary.missing.includes('DATABASE_URL')) {
    instructions.push('')
    instructions.push('1. DATABASE_URL (Required)')
    instructions.push('   You need a PostgreSQL database. Options:')
    instructions.push('   - Vercel Postgres: https://vercel.com/storage/postgres')
    instructions.push('   - Supabase: https://supabase.com/database')
    instructions.push('   - Railway: https://railway.app/new/template/postgres')
    instructions.push('   - Neon: https://neon.tech/')
    instructions.push('   Set as: postgresql://username:password@host:5432/database')
  }

  if (summary.missing.includes('NEXTAUTH_SECRET')) {
    instructions.push('')
    instructions.push('2. NEXTAUTH_SECRET (Required)')
    instructions.push('   Generate a secure random string:')
    instructions.push('   Command: openssl rand -base64 32')
    instructions.push('   Or use: https://generate-secret.vercel.app/32')
  }

  if (summary.missing.includes('NEXTAUTH_URL')) {
    instructions.push('')
    instructions.push('3. NEXTAUTH_URL (Required in production)')
    instructions.push('   Set to your app\'s base URL:')
    instructions.push('   Example: https://your-app.vercel.app')
  }

  if (platform) {
    instructions.push('')
    instructions.push(`Platform-specific instructions for ${platform}:`)
    
    switch (platform.toLowerCase()) {
      case 'vercel':
        instructions.push('- Go to your Vercel dashboard')
        instructions.push('- Select your project > Settings > Environment Variables')
        instructions.push('- Add the variables above')
        break
      case 'netlify':
        instructions.push('- Go to your Netlify dashboard')
        instructions.push('- Select your site > Site settings > Environment variables')
        instructions.push('- Add the variables above')
        break
      default:
        instructions.push('- Add environment variables to your hosting platform')
        instructions.push('- Restart your application after adding variables')
    }
  }

  return instructions.join('\n')
}