// ** React Imports
import { useState } from 'react'

// ** MUI Imports
// import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import { Button} from '@mui/material'

// ** Third Party Imports
import _debounce from 'lodash/debounce'
import toast from 'react-hot-toast'

import CustomTextField from '@/@core/components/mui/TextField'

interface UseFormAutoCompleteProps {
  id: string
  value: string
  open: boolean
  onChange: (value: any) => void
  getOptionsBySearch: (searchQuery: string) => Promise<{ id: string; value: string }[]>
  error: boolean
  label: string
  disabled?: boolean
}



const WaterUtilityAutoComplete = (props: UseFormAutoCompleteProps): JSX.Element => {
  // ** Props

  const { id, value, onChange, getOptionsBySearch, label, open ,disabled } = props




  const [options, setOptions] = useState<{ id: string; value: string }[]>([])
  const [dropDownOpen, setDropDown] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState('')



  const debouncedFetchOptions = _debounce(async (searchText: string) => {
    setOptions([])

    try {
      const fetchedOptions = await getOptionsBySearch(searchText)

      setOptions(fetchedOptions)
    } catch (error) {
      toast.error('Failed to fetch options')
    }
  }, 500)


  const handleSearch = (inputValue : string) => {
    if (inputValue.length >= 3 && open && dropDownOpen) {
      setInputValue(inputValue)
      debouncedFetchOptions(inputValue)
    } else {
      setOptions([])
      setInputValue('')
    }
  }

  // useEffect(() => {

  //   if (!dropDownOpen) return

  //   if (open) {
  //     fetchOptions('')
  //   }
  // }, [fetchOptions, open, dropDownOpen])

  const handleUpdateClick = () => {
    onChange({ id: '', value: '' })
  }



  return id && !disabled ? (
    <CustomTextField
      value={value}
      label={label}
      disabled={disabled}
      InputProps={{
        endAdornment: (
          <>
            <Button onClick={handleUpdateClick}>UPDATE</Button>
          </>
        )      }}
    />
  ) : (
    <Autocomplete
      ListboxProps={{ style: { maxHeight: 150 } }}
      options={options}
      disabled={disabled}
      onOpen={()=>setDropDown(true)}
      onClose={() => {
        setDropDown(false)
        setOptions([])
      }}
      onChange={(event, value) => {
        onChange(value)
      }}
      onInputChange={(event, inputValue) => handleSearch(inputValue)}
      id='autocomplete-asynchronous-request'
      getOptionLabel={option => option.value}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {`${option.value}${id === 'sizeId' ? "'" : ''}`}
        </li>
      )}
      renderInput={params => (
        <CustomTextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      noOptionsText={
         inputValue.length < 3
          ? 'Please enter at least 3 characters to begin the search'
          : options.length === 0
          ? 'No options'
          : ''
      }
    />
  )
}

export default WaterUtilityAutoComplete
