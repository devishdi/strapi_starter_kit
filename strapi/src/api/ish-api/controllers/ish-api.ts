import {
    TENDER_STATUS,
    API_RESULT_FAIL,
} from '../../../../types/custom/common-type';

export default {
    getPageAction: async (ctx, next) => {
        try {
            const path = ctx.request.query?.path;
            const params = ctx.request.query?.params;

            ctx.body = await strapi
                .service('api::sudlife-corp.sudlife-corp')
                .renderContent({ site, path: path, params: params });
        } catch (err) {
            ctx.body = {
                success: false,
                data: {
                    app: {
                        imageBasePath: '',
                        language: '',
                        homeUrl: '',
                    },
                    info: {
                        path: '',
                        pageTitle: '',
                        pageId: '',
                        metaTags: {},
                    },
                    components: {},
                },
                status: 403,
            };
        }
    },
    getGlossaryByKeyword: async (ctx, next) => {
        try {
            const keyword = ctx.request.query?.keyword;
            const planId = ctx.request.query?.planId;

            ctx.body = await strapi
                .service('api::content.glossary')
                .getGlossariesByKeyword({ keyword, planId });
        } catch (err) {
            ctx.body = {
                success: false,
                data: {
                    app: {
                        imageBasePath: '',
                        language: '',
                        homeUrl: '',
                    },
                    info: {
                        path: '',
                        pageTitle: '',
                        metaTags: {},
                    },
                    components: {},
                },
                status: 403,
            };
        }
    },
    getBlogLikeCount: async (ctx, next) => {
        try {
            const blogId = ctx.request.query?.blogId;
            if (blogId == '') {
                ctx.body = {
                    success: false,
                    data: {
                        app: {
                            imageBasePath: '',
                            language: '',
                            homeUrl: '',
                        },
                        info: {
                            path: '',
                            pageTitle: '',
                            metaTags: {},
                        },
                        components: {},
                    },
                    status: 403,
                };
            }

            ctx.body = await strapi
                .service('api::content.blog-api-view')
                .getBlogCount({ blogId });
        } catch (err) {
            ctx.body = {
                success: false,
                data: {
                    app: {
                        imageBasePath: '',
                        language: '',
                        homeUrl: '',
                    },
                    info: {
                        path: '',
                        pageTitle: '',
                        metaTags: {},
                    },
                    components: {},
                },
                status: 403,
            };
        }
    },
    saveLike: async (ctx, next) => {
        try {
            const blogId = ctx.request.body?.blogId;
            const authorization = ctx.request.header.authorization;
            const token = await strapi
                .service('api::content.blog-api-view')
                .getToken({ authorization });

            ctx.body = await strapi
                .service('api::content.blog-api-view')
                .saveBlogLike({ blogId, token });
        } catch (err) {
            ctx.body = API_RESULT_FAIL;
        }
    },
    saveView: async (ctx, next) => {
        try {
            const blogId = ctx.request.body?.blogId;
            const authorization = ctx.request.header.authorization;
            const token = await strapi
                .service('api::content.blog-api-view')
                .getToken({ authorization });

            ctx.body = await strapi
                .service('api::content.blog-api-view')
                .saveBlogView({ blogId, token });
        } catch (err) {
            ctx.body = API_RESULT_FAIL;
        }
    },
    saveRating: async (ctx, next) => {
        try {
            const productId = ctx.request.body?.productId;
            const rating = ctx.request.body?.rating;
            const authorization = ctx.request.header.authorization;
            const token = await strapi
                .service('api::content.product-rating')
                .getToken({ authorization });

            ctx.body = await strapi
                .service('api::content.product-rating')
                .saveProductRating({ productId, token, rating });
        } catch (err) {
            ctx.body = API_RESULT_FAIL;
        }
    },
    getInvestorDocument: async (ctx, next) => {
        try {
            const category = ctx.request.query.category;
            const year = ctx.request.query?.year;
            const quarter = ctx.request.query?.quarter;
            if (category) {
                ctx.body = {
                    success: false,
                    data: {
                        app: {
                            imageBasePath: '',
                            language: '',
                            homeUrl: '',
                        },
                        info: {
                            path: '',
                            pageTitle: '',
                            metaTags: {},
                        },
                        components: {},
                    },
                    status: 403,
                };
            }

            ctx.body = await strapi
                .service('api::content.investors-landing')
                .getInvestoryDocumentList({
                    category,
                    year,
                    quarter,
                });
        } catch (err) {
            ctx.body = {
                success: false,
                data: {
                    app: {
                        imageBasePath: '',
                        language: '',
                        homeUrl: '',
                    },
                    info: {
                        path: '',
                        pageTitle: '',
                        metaTags: {},
                    },
                    components: {},
                },
                status: 403,
            };
        }
    },
    getBlogByFilter: async (ctx, next) => {
        try {
            const category = ctx.request.query.category;
            const title = ctx.request.query?.title;
            const trending = ctx.request.query?.trending;
            const order = ctx.request.query?.order;
            const direction = ctx.request.query?.direction;
            const page = ctx.request.query?.page;
            const apiRequest = true;
            ctx.body = await strapi.service('api::content.blog').getByFilter({
                category,
                title,
                trending,
                order,
                direction,
                page,
                apiRequest,
            });
        } catch (err) {
            console.log('Error from blog Filter', err);
            ctx.body = API_RESULT_FAIL;
        }
    },
    getSitemap: async (ctx, next) => {
        ctx.type = 'text/xml';
        try {
            ctx.body = await strapi
                .service('api::content.sitemap')
                .renderContent();
        } catch (err) {
            ctx.body = '';
        }
    },
    getInvestorFactsheet: async (ctx, next) => {
        try {
            const year = ctx.request.query?.year;
            const month = ctx.request.query?.month;
            if (!year) {
                ctx.body = {
                    success: false,
                    data: {
                        app: {
                            imageBasePath: '',
                            language: '',
                            homeUrl: '',
                        },
                        info: {
                            path: '',
                            pageTitle: '',
                            metaTags: {},
                        },
                        components: {},
                    },
                    status: 403,
                };
            } else {
                ctx.body = await strapi
                    .service('api::content.investors-factsheet')
                    .getInvestoryFactsheetList({
                        year,
                        month,
                    });
            }
        } catch (err) {
            ctx.body = {
                success: false,
                data: {
                    app: {
                        imageBasePath: '',
                        language: '',
                        homeUrl: '',
                    },
                    info: {
                        path: '',
                        pageTitle: '',
                        metaTags: {},
                    },
                    components: {},
                },
                status: 403,
            };
        }
    },
    getFundByFilter: async (ctx, next) => {
        try {
            const fundid = ctx.request.query.fundid;
            const product = ctx.request.query?.product;
            const enddate = ctx.request.query?.enddate;
            const startdate = ctx.request.query?.startdate;
            const apiRequest = true;
            ctx.body = await strapi
                .service('api::content.fund-nav')
                .getFundDetails({
                    fundid,
                    product,
                    startdate,
                    enddate,
                    apiRequest,
                });
        } catch (err) {
            ctx.body = API_RESULT_FAIL;
        }
    },
    getFundDetails: async (ctx, next) => {
        try {
            const fundid = ctx.request.query.fundid;
            const apiRequest = true;
            ctx.body = await strapi
                .service('api::content.fund-nav')
                .getFundDetailsById({
                    fundid,
                    apiRequest,
                });
        } catch (err) {
            ctx.body = API_RESULT_FAIL;
        }
    },
    chatContent: async (ctx, next) => {
        try {
            ctx.body = await strapi
                .service('api::forms.external')
                .fetchChatBot();
        } catch (err) {
            ctx.body = API_RESULT_FAIL;
        }
    },
    getFundNavValue: async (ctx, next) => {
        try {
            const fundid = ctx.request.query.fundid;
            const product = ctx.request.query.product;
            const type = ctx.request.query.type;
            const apiRequest = true;
            ctx.body = await strapi
                .service('api::content.fund-nav')
                .getFundNavValue({
                    fundid,
                    product,
                    type,
                    apiRequest,
                });
        } catch (err) {
            ctx.body = API_RESULT_FAIL;
        }
    },
};
