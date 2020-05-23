import React, { useMemo } from 'react'
import { Provider } from 'react-redux'
import { Switch, Route } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { ConnectedRouter } from 'connected-react-router'
import { ThemeProvider, CssBaseline, createMuiTheme, useMediaQuery } from '@material-ui/core'
import { blue } from '@material-ui/core/colors'

import { Home, SearchResults, PackageInfo, Queue } from './pages'
import { Header } from './components'
import store from './store'
import history from './store/history'

const App = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          primary: blue,
          secondary: {
            main: blue[50]
          },
          type: prefersDarkMode ? 'dark' : 'light'
        },
        typography: {
          fontFamily: 'Hack'
        }
      }),
    [prefersDarkMode]
  )

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <CssBaseline />
          <ConnectedRouter history={history}>
            <Header />
            <Switch>
              <Route exact path="/">
                <Home />
              </Route>
              <Route exact path="/store">
                Store
              </Route>
              <Route exact path="/about">
                About
              </Route>
              <Route exact path="/search">
                <SearchResults />
              </Route>
              <Route exact path="/package">
                <PackageInfo />
              </Route>
              <Route exact path="/queue">
                <Queue />
              </Route>
            </Switch>
          </ConnectedRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default App
