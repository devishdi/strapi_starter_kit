import {
    WithdrawnPlanResponse,
    ProductRequest,
    ProductResponse,
} from '../../../../types/custom/common-type';

export default {
    getWithdrawnPlans: async (id: number): Promise<WithdrawnPlanResponse[]> => {
        let plans = await strapi.query('api::plan.plan').findMany({
            where: {
                withdrawn: 1,
                published_at: {
                    $notNull: true,
                },
            },
            populate: {
                category: { populate: true },
            },
        });

        plans = await strapi
            .service('api::content.plan')
            .formatWthdrawnPlans(plans);

        return plans;
    },
    formatWthdrawnPlans: async (planData): Promise<WithdrawnPlanResponse[]> => {
        const res = [];
        let index = 0;

        for (const plan of planData) {
            if (!plan.category) {
                continue;
            }

            const createdAt = strapi
                .service('api::content.field-render')
                .getDateFromISOFormat(plan.createdAt);

            const withdrawnProductDate = plan.withdrawnProductDate
                ? strapi
                      .service('api::content.field-render')
                      .getDateFromISOFormat(plan.withdrawnProductDate)
                : null;

            const withdrawnProductCategory = await strapi
                .service('api::content.plan')
                .getWithdrawnPlanCategory(plan.category.id);

            const pageData = await strapi.db
                .query('api::corp-page.corp-page')
                .findOne({
                    where: {
                        linkedProduct: {
                            id: plan.id,
                        },
                    },
                });

            res[index] = {
                code: plan.code,
                codeDescription: plan.codeDescription,
                detailPage: pageData?.path ? pageData.path : null,
                createdAt,
                withdrawnProductDate,
                withdrawnProductLink: plan.withdrawnProductLink,
                category: plan.category?.name ?? '',
                withdrawnProductCategory,
            };
            index++;
        }

        return res;
    },
    formatProduct: (product: ProductRequest): ProductResponse => {
        const thumbnailImage = strapi
            .service('api::content.field-render')
            .getMediaImage(product.thumbnail);

        const featureList = product.features.map((data): string => {
            return data.feature;
        });

        return {
            title: product.title,
            path: product.path,
            productId: product.productId,
            description: product.description,
            thumbnail: thumbnailImage,
            features: featureList,
            minAmount: product.min,
            maxAmount: product.max,
            premiumLink: product.premiumLink,
        };
    },
    getProductDetailPage: (planId: number) => {
        if (!planId) {
            return null;
        }

        const pageData = strapi.db.query('api::corp-page.corp-page').findOne({
            where: {
                linkedProduct: {
                    id: planId,
                },
            },
        });

        return pageData ? pageData['path'] : '';
    },

    getWithdrawnPlanCategory: async (id: number): Promise<string> => {
        let withdrawnProductCategory = '';
        const knex = strapi.db.connection;
        const result = await knex('plan_categories')
            .select('plan_categories.name')
            .join(
                'plan_sub_categories_parent_lnk',
                'plan_categories.id',
                '=',
                'plan_sub_categories_parent_lnk.plan_category_id'
            )
            .where({
                'plan_sub_categories_parent_lnk.plan_sub_category_id': id,
            });
        if (result.length > 0) withdrawnProductCategory = result[0].name;

        return withdrawnProductCategory;
    },
};
