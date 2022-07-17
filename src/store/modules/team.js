import axios from 'axios';

const state = {
    teams: [55],
    col: 4
};
const getters = {
    stateTeams: state => state.teams,
};
const actions = {
    async getTeams({commit}) {
        if(!state.teams.length) {
            let response = await axios.get('teams')
            commit('setTeams', response.data)
        }
    },
    async getTeam(commit, id) {
        return axios.get('teams/' + id);
    },
    async createTeam(state, team) {
        state.commit('setTeams', team)
    },
    async updateTeam(state, team) {
        return axios.put('teams/' + team.id, team)
    },
};
const mutations = {
    setTeams(state, teams) {
        state.teams = teams
    },
};


export default {
    state,
    getters,
    actions,
    mutations
};
