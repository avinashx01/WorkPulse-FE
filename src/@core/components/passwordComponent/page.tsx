import React, { useState } from 'react'

import {
  FormControl,

  InputAdornment,
  IconButton,
  Typography
} from '@mui/material'
import { Controller } from 'react-hook-form'
import { Icon } from '@iconify/react'
import PasswordStrengthBar from 'react-password-strength-bar'

import CustomTextField from '../mui/TextField'

interface Feedback {
  warning: string
  suggestions: string[]
}

export interface FeedbackState {
  feedback: Feedback
}

interface PassProps {
  control: any
  errors?: any // Marked optional to avoid the undefined error
  feedBack?: FeedbackState
  setFeedBack?: (feedback: FeedbackState) => void
  name: string
  label: string
  error: boolean
  helperText?: string
}

const PasswordField: React.FC<PassProps> = props => {
  const { control, errors, feedBack, setFeedBack } = props
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [passwordValue, setPasswordValue] = useState('')

  const [strengthLabel, setStrengthLabel] = useState<string>('')

  const handleClickShowPassword = () => {
    setShowPassword(prev => !prev)
  }

  const handlePasswordChange = (password: string) => {
    setPasswordValue(password)
  }

  // Function to map PasswordStrengthBar score to a label
  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
        return 'Very Weak'
      case 1:
        return 'Weak'
      case 2:
        return 'Okay'
      case 3:
        return 'Good'
      case 4:
        return 'Strong'
      default:
        return ''
    }
  }

  return (
    <FormControl fullWidth error={Boolean(errors?.password)}>
      <Controller
        name='password'
        control={control}
        rules={{ required: 'Password is required' }}
        render={({ field: { value, onChange } }) => (
          <CustomTextField
            id='input-new-password'
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={e => {
              onChange(e) // Update react-hook-form state
              handlePasswordChange(e.target.value) // Update our local state for the strength bar
            }}
            label='Password *'
            InputProps={{
              endAdornment:(
              <InputAdornment position='end'>
                <IconButton
                  edge='end'
                  onClick={handleClickShowPassword}
                  onMouseDown={e => e.preventDefault()}
                >
                  <Icon icon={showPassword ? 'bx:show' : 'bx:hide'} />
                </IconButton>
              </InputAdornment>
             )
            }}
            error={Boolean(errors?.password)}
          />
        )}
      />

      {/* Show password strength only if user has typed something and there is no password error */}
      {passwordValue.length > 0 && !errors?.password && (
        <PasswordStrengthBar
          className='password-strength-bar'
          password={passwordValue}
          onChangeScore={(score, feedback) => {
            setFeedBack?.({
              feedback: {
                warning: feedback.warning || '',
                suggestions: feedback.suggestions || []
              }
            })
            setStrengthLabel(getStrengthLabel(score))
          }}
        />
      )}

      {/* Display the strength label if there's text in the password field */}
      {passwordValue.length > 0 && strengthLabel && (
        <Typography variant='body2' sx={{ mt: 1, color: '#000' }}>
          Password Strength:{' '}
          <span style={{ fontWeight: 'bold' }}>
            {errors?.password ? 'Weak' : strengthLabel}
          </span>
        </Typography>
      )}

      {/* If the password is typed and there's a 'warning' from react-password-strength-bar */}
      {passwordValue.length > 0 && feedBack?.feedback.warning && (
        <Typography color='#000' variant='body2' mt={2} whiteSpace='nowrap'>
          {feedBack.feedback.warning}, Kindly provide a better password
        </Typography>
      )}

      {/* If there's a validation error from react-hook-form */}
      {errors?.password && (
        <Typography color='error' variant='body2'>
          {errors.password.message}
        </Typography>
      )}
    </FormControl>
  )
}

export default PasswordField
