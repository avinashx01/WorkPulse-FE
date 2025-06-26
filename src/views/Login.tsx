'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import { Box, styled, useMediaQuery, useTheme } from '@mui/material'

// Third-party Imports
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Controller, useForm } from 'react-hook-form'
import { minLength, nonEmpty, object, pipe, string } from 'valibot'
import type { InferInput, SubmitHandler } from 'valibot'

// Toast Imports
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@/configs/i18n'

// Schema Definition
const schema = object({
  username: pipe(string(), minLength(1, 'This field is required')),
  password: pipe(
    string(),
    nonEmpty('This field is required'),
    minLength(5, 'Password must be at least 5 characters long')
  )
})

let themeConfigFallback = { templateName: 'My App' }
try {
  themeConfigFallback = require('@configs/themeConfig').themeConfig || { templateName: 'My App' }
} catch (e) {
  console.warn('themeConfig not found, using fallback:', e)
}

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const Login = () => {
  const [errorState, setErrorState] = useState<{ message: string[] } | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [utilityName, setUtilityName] = useState<string | null>(null)
  const [isSSO, setIsSSO] = useState<boolean>(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('lg'))

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<{
    username: string
    password: string
  }>({
    resolver: valibotResolver(schema),
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const loaderStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999
  }

  useEffect(() => {
    const hostname = window.location.hostname
    const parts = hostname.split('.')
    let utilityName: string | null = null

    if (parts.length > 1) {
      utilityName = parts[0]
    }

    setUtilityName(utilityName)
    window.localStorage.setItem('utilityShortName', utilityName ?? '')

    const fetchData = async () => {
      if (utilityName) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/organizations/getByOrgShortName?orgShortName=${encodeURIComponent(
              utilityName
            )}`
          )
          const responseData = await response.json()

          window.localStorage.setItem('utilityShortName', utilityName)
          window.localStorage.setItem('organisationId', responseData.id)
          window.localStorage.setItem('isSSO', responseData.isSSO?.toString() ?? 'false')

          setIsSSO(responseData.isSSO ?? false)

          if (responseData?.id) {
            setOrgId(responseData.id)
          } else {
            toast.error('No organization found with the given name.')
          }
        } catch (error) {
          console.error('Error fetching organization:', error)
          toast.error('Failed to fetch organization details.')
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (isSSO) {
      const clientId = '347c5qaupji6jdrf6ec9mq07ug'
      const redirectUri = 'https://ubsso.truwave.us/en/sso/'
      const scope = 'email+openid+phone'
      const domain = 'us-east-1ri6vkseiz.auth.us-east-1.amazoncognito.com'
      const cognitoUrl = `https://${domain}/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`

      window.location.href = cognitoUrl
    }
  }, [isSSO])

  const onSubmit: SubmitHandler<{ username: string; password: string }> = async data => {
    setIsSubmitting(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const loginResponse = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          password: data.password
        })
      })

      const responseData = await loginResponse.json()

      if (!loginResponse.ok) {
        throw new Error(responseData.message || 'Login failed')
      }

      const { access_token, user } = responseData

      window.localStorage.setItem('access_token', access_token)
      window.localStorage.setItem('userId', user.id.toString())
      window.localStorage.setItem('organizationId', user.organization.id.toString())
      window.localStorage.setItem('roleKey', user.role.roleKey)

      const redirectURL = searchParams.get('redirectTo') ?? '/en/dashboards/analytics'
      const roleKey = user.role.roleKey

      if (['TECHNICIAN', 'CC_AGENTS', 'DISPATCHER'].includes(roleKey)) {
        router.replace('/en/dashboards/analytics')
      } else {
        router.replace(redirectURL)
      }

      toast.success('Login successful!')
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid credentials'
      setErrorState({ message: [errorMessage] })
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={loaderStyle} className='flex bs-full justify-center items-center'>
        <CircularProgress />
      </div>
    )
  }

  const LoginForm = (
    <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
      <Controller
        name='username'
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <CustomTextField
            {...field}
            autoFocus
            fullWidth
            label='Username'
            placeholder='Enter your Username'
            onChange={e => {
              field.onChange(e.target.value)
              errorState !== null && setErrorState(null)
            }}
            {...((errors.username || errorState !== null) && {
              error: true,
              helperText: errors?.username?.message || errorState?.message[0]
            })}
          />
        )}
      />

      <Controller
        name='password'
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <CustomTextField
            {...field}
            fullWidth
            label='Password'
            placeholder='············'
            id='login-password'
            type='password'
            onChange={e => {
              field.onChange(e.target.value)
              errorState !== null && setErrorState(null)
            }}
            {...(errors.password && { error: true, helperText: errors.password.message })}
          />
        )}
      />

      <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
        <FormControlLabel control={<Checkbox defaultChecked disabled />} label='Remember me' />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          <Typography
            className='text-end'
            color='primary'
            component={Link}
            href={getLocalizedUrl('/forgot-password', locale as Locale)}
          >
            Forgot password?
          </Typography>
          <Typography
            className='text-end'
            color='primary'
            component={LinkStyled}
            href={getLocalizedUrl('/register', locale as Locale)}
          >
            Register
          </Typography>
        </Box>
      </div>

      {errorState?.message && (
        <Alert severity='error' sx={{ mb: 2 }}>
          <Typography variant='body2' color='error'>
            {errorState.message[0]}
          </Typography>
        </Alert>
      )}

      <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
        {isSubmitting ? <CircularProgress size={24} color='inherit' /> : 'Login'}
      </Button>

      {['ubcustdev', 'ubcustqa', 'devcusttest'].includes(utilityName || '') && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Typography>New on our platform?</Typography>
              <Typography component={Link} href={getLocalizedUrl('/register', locale as Locale)} color='primary'>
                Create an account
              </Typography>

        </Box>
      )}

      {utilityName === 'ubblmcustdev' && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Typography variant='body2' sx={{ mr: 2 }}>
            New on our platform?
          </Typography>
          <Typography>
            <LinkStyled href={`/en/register/?BLMCustomer=${utilityName}`}>Create a customer</LinkStyled>
          </Typography>
        </Box>
      )}
    </form>
  )

  return (
    <>
      <ToastContainer position='top-right' autoClose={3000} />
      <Box className='content-right' sx={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
        {!hidden && (
          <Box
            sx={{
              flex: 3,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme.palette.background.paper,
              position: 'relative'
            }}
          />
        )}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            padding: 3,
            backgroundColor: theme.palette.background.paper,
            borderLeft: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box sx={{ mb: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant='h4'>{`Welcome to ${themeConfigFallback.templateName}! 👋🏻`}</Typography>
            <Typography>Please sign in to your account</Typography>
          </Box>
          {LoginForm}
        </Box>
      </Box>
    </>
  )
}

export default Login
