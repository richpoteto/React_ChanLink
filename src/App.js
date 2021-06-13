import React from 'react';
import {  BrowserRouter, Route, Switch} from "react-router-dom";
import CreateBet from './createBet'
import BetPage from './betPage';


function App() {
  return (
    <>
    <BrowserRouter>
        <Switch>
        
        <Route path='/createbet' component={CreateBet}/>
        <Route path='/bet' component={BetPage}/>
        <Route path="/"/>

        </Switch>    
    </BrowserRouter>
    </>
  )
}

export default App;
