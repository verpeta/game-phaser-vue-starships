import {createRouter, createWebHistory} from 'vue-router';
import Game from "@/game/Game";
import Homepage from "@/views/HomeView";

const routes = [
    {
        path: '/game',
        component: Game,
    },
    {
        path: '/',
        component: Homepage,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
