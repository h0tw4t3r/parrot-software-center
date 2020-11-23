import React, { useState } from 'react'
import { QueueNodeMeta, upgrade } from '../../actions/queue'
import { Grid, Paper, Typography, makeStyles, IconButton, Button } from '@material-ui/core'
import { ExpandMore, ExpandLess, MoreHoriz } from '@material-ui/icons'
import { Img } from 'react-image'
import { push } from 'connected-react-router'
import dummyPackageImg from '../../assets/package.png'
import { connect, ConnectedProps } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { useSnackbar } from 'notistack'

const useStyles = makeStyles(theme => ({
  card: {
    padding: theme.spacing(2)
  },
  media: {
    height: 30,
    width: 30,
    marginRight: theme.spacing(2)
  },
  detailsLink: {
    marginRight: theme.spacing(2)
  },
  pkgName: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  versionHolder: {
    display: 'flex'
  },
  metaHolder: {
    display: 'flex'
  },
  upgrade: {
    color: '#4caf50',
    borderColor: '#4caf50'
  },
  gridItem: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  }
}))

const mapStateToProps = ({ settings: { APIUrl }, queue: { isBusy } }: RootState) => ({
  APIUrl,
  isBusy
})

const mapDispatchToProps = {
  push,
  upgrade
}

const connector = connect(mapStateToProps, mapDispatchToProps)

export type UpdateListInputProp = {
  updates: QueueNodeMeta[]
}
type UpdateListProp = ConnectedProps<typeof connector> & RouteComponentProps & UpdateListInputProp

const UpdateList = ({ updates, push, APIUrl, upgrade, isBusy }: UpdateListProp) => {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const [isExpanded, expand] = useState(false)
  const maxItemsShown = 10
  const areUpdatesMoreThanMaxItems = updates.length > maxItemsShown
  return (
    <>
      {areUpdatesMoreThanMaxItems ? (
        <div style={{ float: 'right' }}>
          <IconButton onClick={() => expand(!isExpanded)} aria-label="collapse/expanded">
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </div>
      ) : undefined}
      <div>
        <Grid container spacing={3}>
          {updates
            .slice(0, isExpanded ? updates.length : maxItemsShown)
            .map(({ name, version, oldVersion, source }, index) => {
              return (
                <Grid item key={index} style={{ width: '100%' }}>
                  <Paper className={classes.card}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Grid className={classes.gridItem} item xs={4}>
                        <div className={classes.metaHolder}>
                          <Img
                            className={classes.media}
                            src={`${APIUrl}/assets/packages/${name}.png`}
                            unloader={
                              <img
                                className={classes.media}
                                src={dummyPackageImg}
                                alt={'No Package Found'}
                              />
                            }
                          />
                          <Typography variant="h5" className={classes.pkgName}>
                            {name}
                          </Typography>
                        </div>
                      </Grid>

                      <Grid className={classes.gridItem} item xs={4}>
                        <Typography variant="h5">{version}</Typography>
                      </Grid>
                      <Grid className={classes.gridItem} item xs={4}>
                        <Typography variant="h6">From: {oldVersion}</Typography>
                      </Grid>
                      <Grid
                        className={classes.gridItem}
                        item
                        container
                        xs={4}
                        justify="space-around"
                      >
                        <Button
                          variant="outlined"
                          color="primary"
                          size="large"
                          onClick={() =>
                            push(`/package/${source === 'APT' ? 'apt' : 'snap'}/${name}`)
                          }
                        >
                          More info
                        </Button>
                        <Button
                          variant="outlined"
                          disabled={isBusy}
                          color="primary"
                          className={classes.upgrade}
                          size="large"
                          onClick={() => {
                            enqueueSnackbar(`Package ${name}@${version} queued for upgrade`, {
                              variant: 'success'
                            })
                            upgrade({ name, version, source: 'APT' })
                          }}
                        >
                          Upgrade
                        </Button>
                      </Grid>
                    </div>
                  </Paper>
                </Grid>
              )
            })}
          {!isExpanded && areUpdatesMoreThanMaxItems ? (
            <IconButton
              style={{ borderRadius: '4px' }}
              onClick={() => expand(!isExpanded)}
              aria-label="collapse"
            >
              <MoreHoriz />
            </IconButton>
          ) : undefined}
        </Grid>
      </div>
    </>
  )
}

export default connector(withRouter(UpdateList))
