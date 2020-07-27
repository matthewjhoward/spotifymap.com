import { combineReducers } from 'redux';
import navigation from './navigation';
import { connectRouter } from 'connected-react-router';

export default (history) =>
  combineReducers({
    router: connectRouter(history),
    navigation,
});
