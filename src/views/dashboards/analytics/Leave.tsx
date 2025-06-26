'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import CardHeader from '@mui/material/CardHeader'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { MenuItem } from '@mui/material'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@/components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Extend table-core types for fuzzy filter
declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, onChange, debounce])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper<any>()

const Leave = () => {
  const router = useRouter();
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [configs, setConfigs] = useState<any[]>([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    configId: '',
    from: '',
    to: '',
    reasonForLeave: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch leave configurations
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('Please log in to continue');
          router.push(`/en/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        const organizationId = localStorage.getItem('organizationId') || '1';
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/configs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('access_token');
            toast.error('Session expired. Please log in again.');
            router.push(`/en/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
            return;
          }
          throw new Error('Failed to fetch configs');
        }
        const configsData = await response.json();
        const filteredConfigs = configsData.filter(
          (config: any) => config.organizationId === Number(organizationId) && config.type === 'leave'
        );
        setConfigs(filteredConfigs);
        setData(
          filteredConfigs.map(config => ({
            id: config.id,
            leaveType: config.configName,
            availableDays: parseInt(config.configValue, 10) || 0,
            bookedDays: 0 // Placeholder
          }))
        );
      } catch (error) {
        console.error('Error fetching configs:', error);
        setError('Failed to load leave configurations');
      }
    };
    fetchConfigs();
  }, [router]);

  const handleOpenDrawer = (configId: number) => {
    setSelectedConfigId(configId);
    setFormData({ configId: configId.toString(), from: '', to: '', reasonForLeave: '' });
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setSelectedConfigId(null);
    setFormData({ configId: '', from: '', to: '', reasonForLeave: '' });
    setError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name: string; value: string }>) => {
    const { name, value } = e.target as any;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please log in to continue');
        router.push(`/en/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      const payload = {
        configId: Number(formData.configId),
        from: formData.from,
        to: formData.to,
        reasonForLeave: formData.reasonForLeave
      };
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/leave/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          toast.error('Session expired. Please log in again.');
          router.push(`/en/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit leave request');
      }
      const newLeave = await response.json();
      setData(data.map(item =>
        item.id === Number(formData.configId)
          ? { ...item, bookedDays: item.bookedDays + 1 }
          : item
      ));
      toast.success('Leave request submitted successfully');
      handleCloseDrawer();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      setError('Failed to submit leave request');
    }
  };

  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          indeterminate={row.getIsSomeSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      )
    },
    columnHelper.accessor('leaveType', {
      header: 'Leave Type',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <CustomAvatar size={34} skin='light' color='primary'>
            <i className='tabler-calendar text-lg' />
          </CustomAvatar>
          <Typography className='font-medium' color='text.primary'>
            {row.original.leaveType}
          </Typography>
        </div>
      )
    }),
    columnHelper.accessor('availableDays', {
      header: 'Available Days',
      cell: ({ row }) => <Typography color='text.primary'>{row.original.availableDays} days</Typography>
    }),
    columnHelper.accessor('bookedDays', {
      header: 'Booked Days',
      cell: ({ row }) => <Typography color='text.primary'>{row.original.bookedDays} days</Typography>
    }),
    columnHelper.accessor('actions', {
      header: 'Apply Leave',
      cell: ({ row }) => (
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleOpenDrawer(row.original.id)}
        >
          Request Leave
        </Button>
      ),
      enableSorting: false
    })
  ], [data]);

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: {
      pagination: {
        pageSize: 5
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  });

  return (
    <Card>
      <CardHeader
        className='flex-wrap gap-x-4 gap-y-2'
        title='Leave Management'
        action={
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Leave Type'
          />
        }
      />

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getIsSorted(),
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <i className='tabler-chevron-up text-xl' />}
                        {header.column.getIsSorted() === 'desc' && <i className='tabler-chevron-down text-xl' />}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.slice(0, table.getState().pagination.pageSize).map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <Typography align="center" sx={{ py: 2 }}>
                    No leave configurations found.
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        rowsPerPageOptions={[5, 7, 10]}
        component={() => <TablePaginationComponent table={table} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />

      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: 400, padding: 2 }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Request Leave</Typography>
          <IconButton onClick={handleCloseDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ padding: 2 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              select
              fullWidth
              label="Leave Type"
              name="configId"
              value={formData.configId}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
              required
              disabled={selectedConfigId !== null}
            >
              {configs.map(config => (
                <MenuItem key={config.id} value={config.id}>
                  {config.configName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="From Date"
              name="from"
              type="date"
              value={formData.from}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="To Date"
              name="to"
              type="date"
              value={formData.to}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Reason for Leave"
              name="reasonForLeave"
              value={formData.reasonForLeave}
              onChange={handleFormChange}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button type="submit" variant="contained" fullWidth>
              Submit Request
            </Button>
          </form>
        </Box>
      </Drawer>
    </Card>
  );
};

export default Leave;
