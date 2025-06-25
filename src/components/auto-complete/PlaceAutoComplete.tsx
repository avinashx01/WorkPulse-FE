// ** React Imports
import React, { useCallback, useEffect, useState } from 'react'

// ** MUI Imports

// import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import { Button, TextField } from '@mui/material'

//** Stores Imports

import { useSelector } from 'react-redux'

import debounce from 'lodash/debounce'

import type { RootState } from '@/redux-store'
import CustomTextField from '@/@core/components/mui/TextField'

//** Third Party Imports

declare global {
  interface Window {
    google: any
  }
}

interface Place {
  place_id: string
  description: string
}

export interface Address {
  description: string
  placeId: string
  streetNumber: string
  route: string
  locality: string
  county: string
  postalCode: string
  postalCodeSuffix: string
  city: string
  state: string
  country: string
  latitude: string
  longitude: string
  description2: string
}

interface PlaceAutocompleteProps {
  label: string
  onPlaceSelect: (address: Address) => void
  value: string
  errors?: boolean
  useFullAddress?: boolean
  disabled?: boolean
  reviewId?: string
  style?: { [key: string]: any }
  defaultTextField?: boolean
}

const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({
  label,
  onPlaceSelect,
  value,
  errors = false,
  useFullAddress = false,
  disabled,
  reviewId,
  style,
  defaultTextField = false
}) => {
  const [autocompleteService, setAutocompleteService] = useState<any>(null)
  const [options, setOptions] = useState<Place[]>([])
  const [addressTyped, setAddressTyped] = useState<Place>({ place_id: '', description: '' })
  const [selected, setSelected] = useState<boolean>(false)

  const store = useSelector((state: RootState) => state.global)

  useEffect(() => {
    if (store.autoCompleteServiceloaded) {
      setAutocompleteService(store.autocompleteService)
    }

    // Reset state when the component mounts or value changes
    if (value) {
      setSelected(true)
      setAddressTyped({ place_id: '', description: value })
    } else {
      // Reset if value is empty
      setSelected(false)
      setAddressTyped({ place_id: '', description: '' })
      setOptions([])
    }
  }, [store.autoCompleteServiceloaded, store.autocompleteService, value])

  const getSuggestions = useCallback(
    (inputValue: string) => {
      if (!store.autoCompleteServiceloaded || !autocompleteService) {
        setOptions([{ place_id: '', description: inputValue }])

        return
      }

      if (!inputValue) {
        return
      }

      autocompleteService.getPlacePredictions(
        {
          input: inputValue,
          types: ['address'],
          componentRestrictions: { country: 'us' }
        },
        (predictions: any[], status: string) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            const suggestion: Place[] = predictions.map(prediction => ({
              place_id: prediction.place_id,
              description: prediction.description
            }))

            suggestion.push({ place_id: '', description: inputValue })
            setOptions(suggestion)
          }
        }
      )
    },
    [autocompleteService, store.autoCompleteServiceloaded]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedHandleInputChange = useCallback(debounce(getSuggestions, 300), [getSuggestions])

  const handleInputChange = (inputValue: string, reason: string) => {
    if (reason === 'clear') {
      setAddressTyped({ place_id: '', description: '' })
      setOptions([])
      onPlaceSelect({
        description: '',
        placeId: '',
        streetNumber: '',
        route: '',
        locality: '',
        county: '',
        postalCode: '',
        postalCodeSuffix: '',
        city: '',
        state: '',
        country: '',
        latitude: '',
        longitude: '',
        description2: ''
      })

      return
    }

    if (inputValue) {
      setAddressTyped({ place_id: '', description: inputValue })
      debouncedHandleInputChange(inputValue)
    } else {
      setOptions([])
    }
  }

  const handlePlaceSelect = async (value: Place | null) => {
    if (!value) {
      return
    }

    if (!value.place_id) {
      onPlaceSelect({
        description: value.description,
        placeId: '',
        streetNumber: '',
        route: '',
        locality: '',
        county: '',
        postalCode: '',
        postalCodeSuffix: '',
        city: '',
        state: '',
        country: '',
        latitude: '',
        longitude: '',
        description2: ''
      })

      return
    }

    const service = new google.maps.places.PlacesService(document.createElement('div'))

    await service.getDetails(
      {
        placeId: value.place_id,
        fields: ['formatted_address', 'address_components', 'geometry.location']
      },
      (placeResult: any, status: string) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const location = placeResult.geometry.location
          const latitude = location.lat()
          const longitude = location.lng()
          const addressComponents = placeResult.address_components
          let streetNumber = ''
          let route = ''
          let locality = ''
          let county = ''
          let postalCode = ''
          let postalCodeSuffix = ''
          let city = ''
          let state = ''
          let country = ''
          let description2 = ''

          for (const component of addressComponents) {
            const componentType = component.types[0]

            if (componentType === 'street_number') streetNumber = component.long_name
            else if (componentType === 'route') route = component.long_name

            // else if (componentType === 'city') city = component.long_name
            else if (componentType === 'administrative_area_level_2') county = component.long_name
            else if (componentType === 'locality') {
              locality = component.long_name
              city = component.long_name // Assign locality to city if needed
            }
            else if (componentType === 'administrative_area_level_1') state = component.short_name
            else if (componentType === 'country') country = component.short_name
            else if (componentType === 'postal_code') postalCode = component.short_name
            else if (componentType === 'postal_code_suffix') postalCodeSuffix = component.short_name
            else if (componentType === 'subpremise') description2 = component.long_name
          }

          let description = value.description

          if (streetNumber && route && !useFullAddress) {
            description = `${streetNumber} ${route}`
          }

          setAddressTyped({ place_id: value.place_id, description: description })
          onPlaceSelect({
            description: description,
            placeId: value.place_id,
            streetNumber,
            route,
            locality,
            county,
            postalCode,
            postalCodeSuffix,
            city,
            state,
            country,
            latitude: latitude,
            longitude: longitude,
            description2
          })
        } else {
          onPlaceSelect({
            description: value.description,
            placeId: '',
            streetNumber: '',
            route: '',
            locality: '',
            county: '',
            postalCode: '',
            postalCodeSuffix: '',
            city: '',
            state: '',
            country: '',
            latitude: '',
            longitude: '',
            description2: ''
          })
        }
      }
    )
  }


  return selected ?
  defaultTextField ? (
    <TextField

    disabled={disabled}
    value={addressTyped.description}
    {...(style ? { sx: style } : {})}
    variant='filled'

    InputProps={{
      endAdornment: !reviewId && (
        <Button
        disabled={disabled}

          onClick={() => {
            // Reset states after update
            setSelected(false)
            setAddressTyped({ place_id: '', description: '' })
            setOptions([])
            onPlaceSelect({
              description: '',
              placeId: '',
              streetNumber: '',
              route: '',
              locality: '',
              county: '',
              postalCode: '',
              postalCodeSuffix: '',
              city: '',
              state: '',
              country: '',
              latitude: '',
              longitude: '',
              description2: ''
            })
          }}
          sx={{ fontSize: '10px', mr: -3 }}
        >
          UPDATE
        </Button>
      )
    }}
  />
   ) : (
    <CustomTextField

    disabled={disabled}
    value={addressTyped.description}
    {...(style ? { sx: style } : {})}
    label='Address Line 1 *'
    variant='filled'

    InputProps={{
      endAdornment: !reviewId && (
        <Button
        disabled={disabled}

          onClick={() => {
            // Reset states after update
            setSelected(false)
            setAddressTyped({ place_id: '', description: '' })
            setOptions([])
            onPlaceSelect({
              description: '',
              placeId: '',
              streetNumber: '',
              route: '',
              locality: '',
              county: '',
              postalCode: '',
              postalCodeSuffix: '',
              city: '',
              state: '',
              country: '',
              latitude: '',
              longitude: '',
              description2: ''
            })
          }}
          sx={{ fontSize: '10px', mr: -3 }}
        >
          UPDATE
        </Button>
      )
    }}
  />
   )


   : (
    <Autocomplete
      onChange={(event, value) => handlePlaceSelect(value)}
      options={options}
      value={addressTyped}
      filterOptions={x => x}
      disabled={disabled}

      onInputChange={(event, inputValue, reason) => handleInputChange(inputValue, reason)}
      id='autocomplete-asynchronous-request'
      getOptionLabel={option => (typeof option === 'string' ? option : option.description)}
      isOptionEqualToValue={(option, value) => option.place_id === value.place_id}
      renderOption={(props, place) => (
        <li {...props} key={place.place_id}>
          {place.place_id ? place.description : 'Add ' + place.description}
        </li>
      )}
      renderInput={params =>
        defaultTextField ? (
        <TextField

          error={errors}
          {...params}
          variant='filled'
          {...(style
            ? {
                sx: {
                  '& .MuiFormControlLabel-label': {
                    color: '#555',
                    fontWeight: 'bold'
                  },
                  ...style
                }
              }
            : {})}
        />
      ) : (
        <CustomTextField

          error={errors}
          {...params}
          label={label}
          variant='filled'
          {...(style
            ? {
                sx: {
                  '& .MuiFormControlLabel-label': {
                    color: '#555',
                    fontWeight: 'bold'
                  },
                  ...style
                }
              }
            : {})}
        />
      )}
    />
  )
}

export default PlaceAutocomplete
