'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'

// Third-party Imports
import classnames from 'classnames'
import axios from 'axios'
import { toast } from 'react-toastify'

// Type Imports
import type { SystemMode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Styled Components
const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 600,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 345,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  textTransform: 'none',
  fontSize: '1rem',
  padding: '10px 0',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground
  }
}))

// Types
interface Organization {
  id: number
  shortName: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

interface Role {
  id: number
  name: string
  organization: { id: number }
}

const Register = ({ mode }: { mode: SystemMode }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [manualOrgCode, setManualOrgCode] = useState('')
  const [roleId, setRoleId] = useState<number | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'

  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const orgCodeFromUrl = searchParams.get('orgCode') || searchParams.get('orgcode')
  const [orgCode, setOrgCode] = useState<string | null>(orgCodeFromUrl)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  useEffect(() => {
    const fetchOrganization = async (code: string) => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/organizations/getByOrgShortName?orgShortName=${encodeURIComponent(code)}`)
        setOrganization(response.data)
        setError(null)
      } catch (err: any) {
        setError('Invalid organization code or organization not found.')
        toast.error('Invalid organization code or organization not found.')
        setOrganization(null)
        setRoles([])
        setRoleId(null)
      }
    }

    if (orgCode) fetchOrganization(orgCode)
    else setError('Please provide an organization code.')
  }, [orgCode])

  useEffect(() => {
    const fetchRoles = async () => {
      if (!organization) {
        setRoles([])
        setRoleId(null)
        return
      }

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/roles`)
        const filteredRoles = response.data.filter((role: Role) => role.organization?.id === organization.id)
        setRoles(filteredRoles)
      } catch (err) {
        console.error('Error fetching roles:', err)
        toast.error('Failed to load roles.')
        setError('Failed to load roles')
      }
    }

    fetchRoles()
  }, [organization])

  const handleOrgCodeSubmit = () => {
    if (manualOrgCode) setOrgCode(manualOrgCode.toUpperCase())
    else setError('Please enter an organization code.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      toast.error('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    if (!organization) {
      setError('No valid organization selected.')
      toast.error('No valid organization selected.')
      setIsSubmitting(false)
      return
    }

    if (!roleId) {
      setError('Please select a role')
      toast.error('Please select a role')
      setIsSubmitting(false)
      return
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/register`, {
        username,
        password,
        organizationId: organization.id,
        roleId
      })

      toast.success('Registration successful!')
      setTimeout(() => router.push(getLocalizedUrl('/login', locale as Locale)), 1000)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      {/* Left Side Illustration */}
      <div className={classnames('flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden', {
        'border-ie': settings.skin === 'bordered'
      })}>
        <RegisterIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && <MaskImg alt='mask' src={authBackground} />}
      </div>

      {/* Right Side Form */}
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/login', locale as Locale)}
          className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Create an Account 👋</Typography>
            <Typography>Join WorkPulse today!</Typography>
          </div>

          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-6'>
            {!orgCode ? (
              <div className='flex flex-col gap-4'>
                <CustomTextField
                  label='Organization Code'
                  value={manualOrgCode}
                  onChange={e => {
                    setManualOrgCode(e.target.value)
                    setError(null)
                  }}
                  placeholder='Enter your organization code'
                />
                <CustomButton onClick={handleOrgCodeSubmit} disabled={isSubmitting}>
                  Submit Code
                </CustomButton>
              </div>
            ) : (
              <CustomTextField label='Organization' value={organization?.name || 'Loading...'} InputProps={{ readOnly: true }} />
            )}

            {orgCode && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleId || ''}
                    onChange={e => setRoleId(Number(e.target.value))}
                    label='Role'
                    disabled={!organization || roles.length === 0}
                  >
                    {roles.length === 0 ? (
                      <MenuItem disabled>No roles available</MenuItem>
                    ) : (
                      roles.map(role => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                <CustomTextField
                  autoFocus
                  fullWidth
                  label='Username'
                  placeholder='Enter your username'
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value)
                    setError(null)
                  }}
                />

                <CustomTextField
                  fullWidth
                  label='Password'
                  placeholder='············'
                  type={isPasswordShown ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                          <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <CustomTextField
                  fullWidth
                  label='Confirm Password'
                  placeholder='············'
                  type={isPasswordShown ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value)
                    setError(null)
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                          <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                {error && (
                  <Alert severity='error'>
                    <Typography variant='body2' color='error'>
                      {error}
                    </Typography>
                  </Alert>
                )}

                <CustomButton fullWidth type='submit' disabled={isSubmitting}>
                  {isSubmitting ? <CircularProgress size={24} color='inherit' /> : 'Register'}
                </CustomButton>
              </>
            )}

            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Already have an account?</Typography>
              <LinkStyled href={getLocalizedUrl('/login', locale as Locale)}>Sign in instead</LinkStyled>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
