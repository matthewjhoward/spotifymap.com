import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ConnectedRouter } from 'connected-react-router';
import { getHistory } from '../index';




/* eslint-disable */
import ErrorPage from '../pages/error';
/* eslint-enable */

import '../styles/theme.scss';
import LayoutComponent from '../components/Layout';

const CloseButton = ({closeToast}) => <i onClick={closeToast} className="la la-close notifications-close"/>

class App extends React.PureComponent {
  render() {
    return (
        
            <div>
            <ToastContainer
                autoClose={5000}
                hideProgressBar
                closeButton={<CloseButton/>}
            />
            <ConnectedRouter history={getHistory()}>
                <HashRouter>
                    <Switch>
                      <Route path="/" exact render={() => <Redirect to="/dashboard"/>}/>

                      <Route path="/" dispatch={this.props.dispatch}
                              component={LayoutComponent}/>

                        <Route path="/error" exact component={ErrorPage}/>
                        <Redirect from="*" to="/dashboard"/>
                    </Switch>
                </HashRouter>
            </ConnectedRouter>

            
        </div>
        
        
        
    );
  }
}

// const mapStateToProps = store => ({
//     currentUser: store.auth.currentUser,
//     loadingInit: store.auth.loadingInit,
//   });

export default connect()(App);
