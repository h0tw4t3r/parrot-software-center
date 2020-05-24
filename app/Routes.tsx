import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Home, PackageInfo, SearchResults, Queue } from './pages';

export default function Routes() {
  return (
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
  );
}
