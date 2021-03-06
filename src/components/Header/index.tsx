import React, { useEffect, useState } from 'react'

import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'

import {
  AppBar,
  Box,
  Button,
  Drawer,
  Divider,
  IconButton,
  Toolbar,
  Typography,
  makeStyles,
  Collapse,
  Badge
} from '@material-ui/core'
import {
  Menu as MenuIcon,
  ChevronLeft as DrawerCloseIcon,
  ImportContacts as FeedIcon,
  Reorder as QueueIcon,
  Explore as MapIcon,
  VpnKey as LoginIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon
} from '@material-ui/icons'
import Alert from '@material-ui/lab/Alert'
import { SnackbarKey, useSnackbar } from 'notistack'
import { unwrapResult } from '@reduxjs/toolkit'
import useConstant from 'use-constant'
import { useTranslation } from 'react-i18next'
import SearchBar from '../SearchBar'
import { AlertActions, AptActions, AuthActions } from '../../actions'
import AuthDialog from '../AuthDialog'
import SettingsDialog from '../SettingsDialog'

const useStyles = makeStyles(theme => ({
  drawer: { width: 250 },
  leftContent: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    // necessary for content to be below src bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end'
  }
}))

const mapStateToProps = ({
  alert,
  auth: { accessToken, role },
  router: {
    location: { pathname }
  },
  queue: { packages }
}: RootState) => ({ alert, token: accessToken, role, pathname, queueLength: packages.length })

const mapDispatchToProps = {
  clear: AlertActions.clear,
  setUserInfo: AuthActions.setUserInfo,
  checkUpdates: AptActions.checkUpdates
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type HeaderProps = ConnectedProps<typeof connector>

const Header = ({
  alert,
  clear,
  checkUpdates,
  token,
  role,
  setUserInfo,
  pathname,
  queueLength
}: HeaderProps) => {
  const classes = useStyles()
  const [drawerOpen, setDrawer] = useState(false)
  const [authOpened, setAuthOpened] = useState(false)
  const [settingsOpened, setSettingsOpened] = useState(false)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const { t } = useTranslation()

  const action = useConstant(
    () =>
      function Action(key: SnackbarKey) {
        return (
          <Button
            color="inherit"
            onClick={() => {
              closeSnackbar(key)
            }}
          >
            OK
          </Button>
        )
      }
  )

  useEffect(() => {
    let active = true
    const f = async () => {
      const result = await checkUpdates()

      if (!active) return
      enqueueSnackbar(`${unwrapResult(result).length} ${t('pkgAvailable')}`, {
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        action
      })
    }
    f()
    return () => {
      active = false
    }
  }, [])
  const handleDrawerOpen = () => setDrawer(true)
  const handleDrawerClose = () => setDrawer(false)
  return (
    <>
      <AppBar color="primary" position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          {/* This should be replaced by logo */}
          <Box className={classes.leftContent}>
            <Typography variant="h6">ParrotOS Software Center</Typography>
          </Box>
          <Collapse in={!pathname.includes('search')}>
            <SearchBar />
          </Collapse>
        </Toolbar>
        <Divider />
      </AppBar>
      <Drawer classes={{ paper: classes.drawer }} open={drawerOpen} onClose={handleDrawerClose}>
        <div className={classes.drawerHeader}>
          <Button startIcon={<DrawerCloseIcon />} fullWidth onClick={handleDrawerClose}>
            {t('hide')}
          </Button>
        </div>
        <Divider />
        <Button startIcon={<FeedIcon />} size="large" component={Link} to="/">
          {t('home')}
        </Button>
        <Button
          startIcon={
            <Badge badgeContent={queueLength} color="primary">
              <QueueIcon />
            </Badge>
          }
          size="large"
          component={Link}
          to="/queue"
        >
          {t('queue')}
        </Button>
        {role === 'moderator' && (
          <Button startIcon={<AssessmentIcon />} size="large" component={Link} to="/reports">
            {t('reports')}
          </Button>
        )}
        <Button startIcon={<MapIcon />} size="large" component={Link} to="/mirrors">
          {t('mirrors')}
        </Button>
        <Button startIcon={<SettingsIcon />} onClick={() => setSettingsOpened(true)} size="large">
          {t('settings')}
        </Button>
        <Divider />
        {token ? (
          <Button
            startIcon={<LoginIcon />}
            onClick={() => setUserInfo({ login: '', accessToken: '', refreshToken: '', role: '' })}
            size="large"
          >
            {t('logout')}
          </Button>
        ) : (
          <Button startIcon={<LoginIcon />} onClick={() => setAuthOpened(true)} size="large">
            {t('login')}
          </Button>
        )}
        {authOpened && <AuthDialog onClose={() => setAuthOpened(false)} />}
        {settingsOpened && <SettingsDialog onClose={() => setSettingsOpened(false)} />}
      </Drawer>
      {alert && (
        <Alert severity="error" onClose={() => clear()}>
          {alert}
        </Alert>
      )}
    </>
  )
}

export default connector(Header)
