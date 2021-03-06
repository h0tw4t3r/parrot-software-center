import React, { useState } from 'react'
import { AptActions } from '../../actions'
import {
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@material-ui/core'
import { Controller } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { connect, ConnectedProps } from 'react-redux'
import { useForm } from 'react-hook-form'
import { Rating } from '@material-ui/lab'
import { useTranslation } from 'react-i18next'

const mapStateToProps = ({ auth: { accessToken, login } }: RootState) => ({
  token: accessToken,
  login
})

const mapDispatchToProps = { rate: AptActions.rate }

const connector = connect(mapStateToProps, mapDispatchToProps)

type RatingDialogProps = ConnectedProps<typeof connector> & {
  onClose: () => void
  name: string
  rating: number
  addFn: (rating: number, commentary: string) => void
}

type FormData = {
  rating: number
  commentary: string
}

const RatingDialog = ({ name, onClose, rating, token, rate, addFn }: RatingDialogProps) => {
  const [loading, setLoading] = useState(false)

  const { enqueueSnackbar } = useSnackbar()
  const { register, handleSubmit, control } = useForm<FormData>()

  const { t } = useTranslation()

  return (
    <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
      <form
        onSubmit={handleSubmit(async ({ rating, commentary }) => {
          setLoading(true)
          await rate({ name, token, rating, commentary })
          setLoading(false)
          addFn(rating, commentary)
          enqueueSnackbar(`${t('reviewSent')}`)
          onClose()
        })}
      >
        <DialogTitle id="form-dialog-title">{t('shareReview')}</DialogTitle>
        <DialogContent>
          <Controller name="rating" control={control} as={Rating} defaultValue={rating} />
          <TextField
            autoFocus
            multiline
            margin="dense"
            name="commentary"
            label={t('commentary')}
            inputRef={register({ required: true, minLength: 3, maxLength: 256 })}
            rows={10}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          {loading && <CircularProgress />}
          <Button onClick={onClose} color="primary">
            {t('cancel')}
          </Button>
          <Button color="primary" type="submit">
            {t('send')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default connector(RatingDialog)
