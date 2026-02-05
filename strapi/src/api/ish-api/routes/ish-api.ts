export default {
    routes: [
        {
            method: 'GET',
            path: '/ish/page',
            handler: 'ish-api.getPageAction',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
