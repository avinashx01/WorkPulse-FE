// src/pages/Login.tsx

'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports


import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

// MUI Imports
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress' // Import Circular Progress
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { valibotResolver } from '@hookform/resolvers/valibot'
import { signIn } from 'next-auth/react'
import type { SubmitHandler } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import type { InferInput } from 'valibot'
import { minLength, nonEmpty, object, pipe, string } from 'valibot'

// Type Imports
import { toast } from 'react-toastify'

import { Box, Card, CardContent, styled, useMediaQuery, useTheme } from '@mui/material'
import { Icon } from '@iconify/react'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@/configs/i18n'
import { encryptAppDetails } from '@/utils/encryptAppDetails'// Ensure this path is correct

// Axios Interceptor
import { axiosInterceptor } from '@/utils/axiosInterceptor'



import type { AppDetail,AppDetailsResponse  } from '@/hooks/useAppDetails'

type ErrorType = {
  message: string[]
}

type FormData = InferInput<typeof schema>

const schema = object({
  username: pipe(string(), minLength(1, 'This field is required')),
  password: pipe(
    string(),
    nonEmpty('This field is required'),
    minLength(5, 'Password must be at least 5 characters long')
  )
})

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const APP_DETAILS_STORAGE_KEY = 'appDetailsEncrypted'

const Login = () => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [utilityName, setUtilityName] = useState<string | null>('')
  const [imageLoading, setImageLoading] = useState<boolean>(true)
  const [imageSrc, setImageSrc] = useState('')
  const [isSSO, setIsSSO] = useState<boolean>(false)

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('lg'))

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const loaderStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999
  } as React.CSSProperties





  

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  // Fetch orgId based on the utility name (subdomain)
  useEffect(() => {
    const hostname = window.location.hostname
    const parts = hostname.split('.')

    let utilityName: string | null = null

    if (parts.length > 1) {
      utilityName = parts[0] // The first part is the subdomain
    }

    setUtilityName(utilityName)
    window.localStorage.setItem('utilityShortName', utilityName ?? '')

    const fetchData = async () => {
      if (utilityName) {
        try {
          setImageLoading(true)

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/organization/getByOrgShortName?orgShortName=${utilityName}`
          )

          const responseData = await response.json()

          window.localStorage.setItem('utilityShortName', utilityName)
           window.localStorage.setItem('organisationId', responseData.id)
         
          window.localStorage.setItem('isSSO', responseData.isSSO)

          setIsSSO(responseData.isSSO) //Is SSO to determine the ORG have sso or not

          if (responseData && responseData.id) {
            setOrgId(responseData.id) // Store the orgId in state
           
          } else {
            toast.error('No organization found with the given name.')
          }
        } catch (error: any) {
        } finally {
          setLoading(false) // Ensure loading state is set to false after fetch
          setImageLoading(false)
        }
      } else {
        setLoading(false) // Even if no utilityName, loading should stop
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

      // Redirect to AWS Cognito Hosted UI
      window.location.href = cognitoUrl
    }
  }, [isSSO])

  useEffect(() => {
    if (imageLoading) {
      return
    }

    const newImageSrc =
      utilityName === 'uborgdev'
        ? '/images/pages/boy-with-laptop-light.png'
        : utilityName === 'ubsuperadmindev'
          ? '/images/pages/admin.png'
          : ''

    if (imageSrc !== newImageSrc) {
      setImageSrc(newImageSrc)
    }
  }, [imageSrc, imageLoading, utilityName])

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    setIsSubmitting(true) // Set submitting state to true when form is submitted

    // Log the orgId for debugging

    // Authenticate the user
    const res = await signIn('credentials', {
      redirect: false,

      // isSSO: true,
      // code: "9aff3d2b-d368-4272-adfd-089252d76ab4",

      // orgId: 12

      username: data.username,
      password: data.password,
      orgId: orgId || '' // Pass the orgId if available
    })

    setIsSubmitting(false) // Set submitting state to false once login process is done

    if (res?.error && res.error.startsWith('MFA_REQUIRED:')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, mfaSession, mfaUsername] = res.error.split(':')

      window.localStorage.setItem('mfaSession', mfaSession)
      window.localStorage.setItem('mfaUsername', mfaUsername)

      toast('MFA is required. Please verify OTP.')
      router.push('/verify-otp')
    } else if (res?.error) {
      // Handle other errors
      setErrorState({ message: [res.error] })
      toast.error(res.error)
    } else if (res?.ok && !res.error) {
      // Fetch and store appDetails

      const LoginURL =
        utilityName === 'ubcustdev' || utilityName === 'ubcustqa' || utilityName === 'devcusttest' || utilityName === 'ubblmcustdev'
          ? '/auth/authenticateBasedOnAppDetailsCustomer'
          : '/auth/authenticateBasedOnAppDetails'

      try {
        const appDetailsResponse: any = await axiosInterceptor.post<AppDetailsResponse>(LoginURL, {
          username: data.username,
          organizationId: parseInt(orgId!) || 0
        })

        // Log the actual response

        // Safely access appDetails
        let fetchedAppDetails: AppDetail[] | undefined

        if (Array.isArray(appDetailsResponse.data) && appDetailsResponse.data.length > 0) {
          fetchedAppDetails = appDetailsResponse.data[0]?.appDetails
        } else {
          fetchedAppDetails = undefined
        }

        if (fetchedAppDetails && Array.isArray(fetchedAppDetails)) {
          // Encrypt and store in localStorage
          const encryptedAppDetails = encryptAppDetails(fetchedAppDetails)

          localStorage.setItem(APP_DETAILS_STORAGE_KEY, encryptedAppDetails)
          toast.success('Login successful!')

          const redirectURL = searchParams.get('redirectTo') ?? '/en/consoleHomePage'

          if (utilityName === 'ubcustdev' || utilityName === 'ubcustqa' || utilityName === 'devcusttest' || utilityName === 'ubblmcustdev') {
            window.localStorage.setItem('applicationType', fetchedAppDetails[0].applicationName)
            window.localStorage.setItem('currentAppType', fetchedAppDetails[0].applicationName)
            window.localStorage.setItem('roleKey', fetchedAppDetails[0].roleDetails[0].roleKey)

            if (utilityName === 'ubblmcustdev') {
              window.localStorage.setItem(
                'customerDetails',
                JSON.stringify(fetchedAppDetails[0]?.customerDetails || [])
              )
            }

            window.localStorage.setItem('AccountDetails', JSON.stringify(fetchedAppDetails[0].accountDetails || []))

            if (fetchedAppDetails[0].accountDetails) {
              router.replace('/en/consoleHomePage')
            } else if (fetchedAppDetails[0].serviceDetails === 'Pending') {
              router.replace('/en/pendingServicePage')
            } else {
              router.replace(redirectURL)
            }
          } else {
            const roleKey = fetchedAppDetails[0].roleDetails[0].roleKey

            if (roleKey === 'TECHNICIAN' || roleKey === 'CC_AGENTS' || roleKey === 'DISPATCHER') {
              window.localStorage.setItem('applicationType', fetchedAppDetails[0].applicationName)
              window.localStorage.setItem('currentAppType', fetchedAppDetails[0].applicationName)
              window.localStorage.setItem('roleKey', fetchedAppDetails[0].roleDetails[0].roleKey)
              router.replace('/en/dashboards/analytics')
            } else {
              router.replace(redirectURL)
            }
          }
        } else {
          toast.error('Invalid application details received.')

          return
        }
      } catch (error: any) {
        toast.error('Login successful, but failed to fetch application details.')
      }
    }
  }

  if (loading) {
    return (
      <div style={loaderStyle} className='flex bs-full justify-center items-center'>
        <CircularProgress /> {/* Loader for orgId fetching */}
      </div>
    )
  }

  const services = [
    {
      title: 'Start Water Service',
      description: 'Start Water service at a new or existing location',
      icon: <Icon icon='game-icons:tap' fontSize={'20px'} />,
      action: 'START SERVICE'
    }

    // {
    //   title: 'Stop Water Service',
    //   description: 'Stop Water service at an existing location',
    //   icon: <Icon  icon="bi:sign-stop"  fontSize={'20px'}/>,
    //   action: 'STOP SERVICE',
    // },
    // {
    //   title: 'Transfer Water Service',
    //   description: 'Transfer Water service from an existing location to a new location',
    //   icon: <Icon icon="mdi:truck" fontSize={'20px'}/>,
    //   action: 'TRANSFER SERVICE',
    // },
  ]

  return (
    <>
      {utilityName ? (
        <>
          <Box className='content-right' sx={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
            {!hidden ? (
              <Box
                sx={{
                  flex: 3,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.palette.background.paper,
                  position: 'relative'
                }}
              >
                {utilityName === 'ubcustdev' ||
                  utilityName === 'ubcustqa' ||
                  (utilityName === 'devcusttest' && (
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', cursor: 'pointer' }}
                    >
                      {services.map((service, idx) => (
                        <Card key={idx}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <Typography sx={{ pr: 10 }}>{service.icon}</Typography>
                              <Box>
                                <Typography>{service.description}</Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  ))}


                {(utilityName != 'ubcustdev' || 'devcusttest' || 'ubcustqa' || 'ubblmcustdev' ) && !imageLoading && imageSrc ? (
                  <Image
                    src={imageSrc}
                    height={0}
                    width={0}
                    sizes='100vw'
                    style={{
                      width: '100%',
                      height: '100%',
                      zIndex: 2,
                      margin: theme.spacing(12)
                    }}
                    alt='login-illustration'
                  />
                ) : null}
              </Box>
            ) : null}
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
                <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}! 👋🏻`}</Typography>
                <Typography>Please sign in to your account</Typography>
              </Box>

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
                      type={isPasswordShown ? 'text' : 'password'}
                      onChange={e => {
                        field.onChange(e.target.value)
                        errorState !== null && setErrorState(null)
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onClick={handleClickShowPassword}
                              onMouseDown={e => e.preventDefault()}
                            >
                              <i className={isPasswordShown ? 'tabler-eye' : 'tabler-eye-off'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      {...(errors.password && { error: true, helperText: errors.password.message })}
                    />
                  )}
                />

                <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                  <FormControlLabel control={<Checkbox defaultChecked disabled />} label='Remember me' />
                  <Typography
                    className='text-end'
                    color='primary'
                    component={Link}
                    href={getLocalizedUrl('/forgot-password', locale as Locale)}
                  >
                    Forgot password?
                  </Typography>
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

                {(utilityName === 'ubcustdev' || utilityName === 'ubcustqa' || utilityName === 'devcusttest') && (
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <>
                      <Typography variant='body2' sx={{ mr: 2 }}>
                        New on our platform?
                      </Typography>
                      <Typography>
                        <LinkStyled href={`/en/register/?Customer=${utilityName}`}>Create an account</LinkStyled>
                      </Typography>
                    </>
                  </Box>
                )}

{(utilityName === 'ubblmcustdev') && (
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <>
                      <Typography variant='body2' sx={{ mr: 2 }}>
                        New on our platform?
                      </Typography>
                      <Typography>
                        <LinkStyled href={`/en/register/?BLMCustomer=${utilityName}`}>Create a customer</LinkStyled>
                      </Typography>
                    </>
                  </Box>
                )}
              </form>
            </Box>
          </Box>
        </>
      ) : (
        <>
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
              <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}! 👋🏻`}</Typography>
              <Typography>Please sign in to your account</Typography>
            </Box>

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
                    type={isPasswordShown ? 'text' : 'password'}
                    onChange={e => {
                      field.onChange(e.target.value)
                      errorState !== null && setErrorState(null)
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <i className={isPasswordShown ? 'tabler-eye' : 'tabler-eye-off'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    {...(errors.password && { error: true, helperText: errors.password.message })}
                  />
                )}
              />

              <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                <FormControlLabel control={<Checkbox defaultChecked disabled />} label='Remember me' />
                <Typography
                  className='text-end'
                  color='primary'
                  component={Link}
                  href={getLocalizedUrl('/forgot-password', locale as Locale)}
                >
                  Forgot password?
                </Typography>
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
            </form>
          </Box>
        </>
      )}
    </>
  )
}

export default Login
