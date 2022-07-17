const state = {
    currentPlayer: {},
};
const getters = {
    stateCurrentPlayer: state => state.currentPlayer,
};
const actions = {
    async getCurrentPlayer() {
        return this.state.currentPlayer;
    },
    async setCurrentPlayer(state, playerData) {
        state.commit('setCurrentPlayer', playerData)
    },
};
const mutations = {
    setCurrentPlayer(state, playerData) {
        state.currentPlayer = playerData
    },
};


export default {
    state,
    getters,
    actions,
    mutations
};
