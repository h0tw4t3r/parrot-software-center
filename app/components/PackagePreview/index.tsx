import React, { useEffect, useState } from 'react'
import classnames from 'classnames'

import { connect, ConnectedProps } from 'react-redux'
import { Img } from 'react-image'
import { push } from 'connected-react-router'
import { useSnackbar } from 'notistack'

import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  makeStyles,
  Paper,
  Typography
} from '@material-ui/core'
import { grey, orange, red } from '@material-ui/core/colors'
import dummyPackageImg from '../../assets/package.png'
import { AptActions, QueueActions } from '../../actions'
import { QueueNode } from '../../store/reducers/queue'
import { unwrapResult } from '@reduxjs/toolkit'

const useStyles = makeStyles(theme => ({
  root: {
    width: '80vw'
  },
  description: {
    whiteSpace: 'pre-wrap',
    paddingTop: theme.spacing(2)
  },
  media: {
    height: 40,
    width: 40
  },
  header: {
    padding: theme.spacing(2),
    display: 'flex',
    flexFlow: 'column'
  },
  nameHolder: {
    display: 'flex',
    alignItems: 'center'
  },
  cve: {
    display: 'inline-grid',
    gridTemplateColumns: 'auto auto auto auto',
    alignItems: 'center',
    gridGap: theme.spacing(1),
    paddingTop: theme.spacing(1),
    marginLeft: 'auto'
  },
  buttons: {
    justifyContent: 'flex-end'
  },
  cveCritical: {
    background: red[500]
  },
  cveImportant: {
    background: orange[500]
  },
  name: {
    paddingLeft: theme.spacing(1)
  },
  chipText: {
    color: grey[900]
  }
}))

const mapStateToProps = ({ queue: { packages } }: RootState) => ({ packages })

const mapDispatchToProps = {
  push,
  install: QueueActions.install,
  uninstall: QueueActions.uninstall,
  status: AptActions.status
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type PackagePreviewProps = ConnectedProps<typeof connector> & {
  imageUrl: string
  name: string
  description: string
  cveInfo: {
    critical: number
    important: number
    low: number
  }
}

const PackagePreview = ({
  imageUrl,
  name,
  description,
  push,
  install,
  uninstall,
  packages,
  cveInfo,
  status
}: PackagePreviewProps) => {
  const [installedOrQueried, setInstalled] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  useEffect(() => {
    const f = async () => {
      const foundPackage = packages.find((pkg: QueueNode) => name === pkg.name)
      if (foundPackage) setInstalled(!!foundPackage.flag)
      else setInstalled(unwrapResult(await status(name)))
    }
    f()
  }, [])
  return (
    <Card className={classes.root}>
      <CardActionArea
        onClick={() =>
          push({
            pathname: '/package',
            state: {
              name,
              description,
              imageUrl,
              installed: installedOrQueried
            }
          })
        }
      >
        <CardContent>
          <Paper className={classes.header} elevation={10}>
            <div className={classes.nameHolder}>
              <Img
                className={classes.media}
                src={imageUrl}
                unloader={
                  <img className={classes.media} src={dummyPackageImg} alt={'No Package Found'} />
                }
              />
              <Typography className={classes.name} variant="h5">
                {name}
              </Typography>
            </div>
            <div className={classes.cve}>
              <Chip label={'This month CVEs:'} />
              <Chip
                className={classnames(classes.cveCritical, classes.chipText)}
                label={`Crnamesitical: ${cveInfo.critical}`}
              />
              <Chip
                className={classnames(classes.cveImportant, classes.chipText)}
                label={`Important: ${cveInfo.important}`}
              />
              <Chip label={`Low: ${cveInfo.low}`} />
            </div>
          </Paper>
          <Typography
            className={classes.description}
            variant="body1"
            color="textSecondary"
            component="p"
            noWrap
          >
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions className={classes.buttons}>
        {installedOrQueried ? (
          <Button
            onClick={() => {
              enqueueSnackbar(
                packages.find((el: QueueNode) => el.name === name)
                  ? `Package ${name} dequeued`
                  : `Package ${name} queued for deletion`,
                {
                  variant: 'error'
                }
              )
              uninstall(name)
              setInstalled(false)
            }}
            variant="outlined"
            size="medium"
            color="secondary"
          >
            Uninstall
          </Button>
        ) : (
          <Button
            onClick={() => {
              enqueueSnackbar(
                packages.find((el: QueueNode) => el.name === name)
                  ? `Package ${name} dequeued`
                  : `Package ${name} queued for installation`,
                {
                  variant: 'success'
                }
              )
              install(name)
              setInstalled(true)
            }}
            variant="outlined"
            size="medium"
            color="primary"
          >
            Install
          </Button>
        )}
      </CardActions>
    </Card>
  )
}

export default connector(PackagePreview)
