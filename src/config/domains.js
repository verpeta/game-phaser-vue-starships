const envs = {
    local: {
        server: "http://localhost:3005"
    },
    prod: {
        server: "http://168.119.248.32:3005"
    }
}

export default envs['prod'];
