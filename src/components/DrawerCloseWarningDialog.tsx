// ** MUI Imports

import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'


interface DrawerCloseProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

const DrawerCloseWarningDialog = (props: DrawerCloseProps) => {
  // ** Props
  const { open, onClose, onConfirm } = props

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent sx={{ textAlign: 'center', padding: '16px 24px' }}>
        <Typography sx={{ fontWeight: 400, color:  'text.primary', fontSize: '14px' }} gutterBottom>
          You have unsaved changes.
        </Typography>
        <Typography sx={{ fontWeight: 400, color:  'text.primary', fontSize: '14px' }}>
          Are you sure you want to discard them?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', padding: '8px 24px' }}>
        <Button onClick={onClose} color="primary" variant ='tonal' size='small'>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="secondary" variant ='outlined' size='small' autoFocus>
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DrawerCloseWarningDialog
