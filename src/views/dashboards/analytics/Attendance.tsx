'use client'

import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  useTheme
} from '@mui/material'
import { useState } from 'react'
import { format, addDays, startOfWeek, setHours, setMinutes } from 'date-fns'
import classnames from 'classnames'
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

const data = [
  {
    title: 'Present',
    amount: '20',
    trendNumber: '85%',
    avatarColor: 'success',
    icon: 'tabler-check'
  },
  {
    title: 'Absent',
    amount: '2',
    trendNumber: '5%',
    trend: 'negative',
    avatarColor: 'error',
    icon: 'tabler-x'
  },
  {
    title: 'Leave',
    amount: '3',
    trendNumber: '10%',
    avatarColor: 'warning',
    icon: 'tabler-calendar'
  }
]

const Attendance = () => {
  const theme = useTheme()
  const [selectedDate] = useState(new Date())
  const attendanceData = {
    '2025-06-25T13:00': 'Leave',
    '2025-06-24T09:00': 'Absent'
  }

  const hours = Array.from({ length: 24 }, (_, i) => `${i === 0 ? 12 : i > 12 ? i - 12 : i} ${i < 12 ? 'AM' : 'PM'}`)

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const isToday = (date: Date) => format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  const getStatus = (day: Date, hourIndex: number) => {
    const datetime = setHours(setMinutes(day, 0), hourIndex)
    const key = format(datetime, "yyyy-MM-dd'T'HH:mm")
    return attendanceData[key]
  }

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[2]
      }}
    >
      <CardHeader
        title="Attendance Calendar"
        subheader={`Week of ${format(weekStart, 'dd MMM yyyy')}`}
        action={<OptionMenu options={['This Week', 'Last Week', 'This Month']} />}
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Calendar Grid */}
        <div style={{ overflowX: 'auto', border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }}>
          <div className="min-w-[900px]">
            {/* Days Header */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] text-sm font-medium">
              <div
                style={{
                  padding: '8px',
                  background: theme.palette.action.hover,
                  color: theme.palette.text.primary
                }}
              >
                Time
              </div>
              {days.map(day => (
                <div
                  key={day.toISOString()}
                  style={{
                    padding: '8px',
                    background: theme.palette.action.hover,
                    color: isToday(day) ? theme.palette.primary.main : theme.palette.text.primary,
                    borderLeft: `1px solid ${theme.palette.divider}`
                  }}
                >
                  {format(day, 'EEE dd')}
                </div>
              ))}
            </div>

            {/* Hour Blocks */}
            {hours.map((label, hourIndex) => (
              <div
                key={label}
                className="grid grid-cols-[80px_repeat(7,1fr)] text-xs"
              >
                <div
                  style={{
                    padding: '8px',
                    color: theme.palette.text.secondary,
                    background: theme.palette.action.selected,
                    borderTop: `1px solid ${theme.palette.divider}`
                  }}
                >
                  {label}
                </div>
                {days.map(day => {
                  const status = getStatus(day, hourIndex)
                  let bg = theme.palette.background.default
                  if (status === 'Absent') bg = theme.palette.error.light
                  else if (status === 'Leave') bg = theme.palette.warning.light
                  else if (status === 'Present') bg = theme.palette.success.light

                  return (
                    <div
                      key={format(day, 'yyyy-MM-dd') + hourIndex}
                      style={{
                        padding: '8px',
                        height: '48px',
                        backgroundColor: bg,
                        borderLeft: `1px solid ${theme.palette.divider}`,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        transition: 'background 0.2s ease'
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <CustomAvatar skin="light" variant="rounded" color={item.avatarColor} size={34}>
              <i className={classnames(item.icon, 'text-[22px]')} />
            </CustomAvatar>
            <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-1 is-full">
              <Typography className="font-medium" color="text.primary">
                {item.title}
              </Typography>
              <div className="flex items-center gap-4">
                <Typography>{item.amount}</Typography>
                <Typography
                  className="flex justify-end is-11"
                  color={`${item.trend === 'negative' ? 'error' : 'success'}.main`}
                >
                  {item.trendNumber}
                </Typography>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default Attendance
