import {createStore} from 'vuex'

import team from './modules/team';
import currentPlayer from './modules/currentPlayer';

const store = createStore({
    modules: {
        currentPlayer,
        team,
    }
})

export default store;
