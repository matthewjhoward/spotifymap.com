import React from 'react';
import ReactDOM from 'react-dom';
import { routerMiddleware } from 'connected-react-router';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux'
import ReduxThunk from 'redux-thunk'
import * as serviceWorker from './serviceWorker';


import App from './components/App';
import createRootReducer from './reducers';
import { createHashHistory } from 'history';


const history = createHashHistory();

export function getHistory() {
  return history;
}



export const store = createStore(
    createRootReducer(history),
        compose(
        applyMiddleware(
        routerMiddleware(history),
        ReduxThunk
        ),
    )
);


ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
