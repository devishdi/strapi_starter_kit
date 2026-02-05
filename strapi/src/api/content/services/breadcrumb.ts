export default {
    getData: async (pageId: number, currentPage: boolean, breadcrumb = []) => {
        const pageRes = await strapi
            .service('api::content.breadcrumb')
            .getPage(pageId);

        breadcrumb = [
            ...breadcrumb,
            {
                title: pageRes.title,
                path: pageRes.path,
                disable: currentPage,
            },
        ];

        if (pageRes.parent) {
            return await strapi
                .service('api::content.breadcrumb')
                .getData(pageRes.parent.id, false, breadcrumb);
        } else {
            return breadcrumb.length > 1 ? breadcrumb.reverse() : [];
        }
    },
    getPage: async (pageId: number) => {
        const pageResult = await strapi.db
            .query('api::corp-page.corp-page')
            .findOne({
                where: {
                    id: pageId,
                },
                populate: {
                    parent: { populate: true },
                },
            });

        return pageResult;
    },
};
