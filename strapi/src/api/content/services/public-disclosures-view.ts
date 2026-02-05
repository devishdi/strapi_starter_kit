import {
    DisclosureResponse,
    disclosureApiParam,
    PublicdisclosureResponse,
} from '../../../../types/custom/common-type';

export default {
    getPublicdisclosures: async ({ type }: disclosureApiParam) => {
        const result = await strapi.db
            .query('api::public-disclosure.public-disclosure')
            .findMany({
                where: { type: type, publishedAt: { $notNull: true } },
                populate: {
                    financial_year: { populate: true },
                    q1: { populate: true },
                    q2: { populate: true },
                    q3: { populate: true },
                    q4: { populate: true },
                    year: { populate: true },
                },
            });
        if (result.length === 0) {
            return [];
        }

        return await strapi
            .service('api::content.public-disclosures-view')
            .formatPublicdisclosures(result);
    },
    formatPublicdisclosures: async (publicDisclosureData) => {
        const res = [];

        for (const [index, data] of publicDisclosureData.entries()) {
            const q1 = await strapi
                .service('api::content.public-disclosures-view')
                .getquarterData(data.q1);

            const q2 = await strapi
                .service('api::content.public-disclosures-view')
                .getquarterData(data.q2);

            const q3 = await strapi
                .service('api::content.public-disclosures-view')
                .getquarterData(data.q3);

            const q4 = await strapi
                .service('api::content.public-disclosures-view')
                .getquarterData(data.q4);

            res[index] = {
                id: data.id,
                financial_year: data.financial_year,
                type: data.type,
                year: data.year,
                q1,
                q2,
                q3,
                q4,
            };
        }

        return res;
    },
    getquarterData: async (data) => {
        if (data) {
            const document = strapi
                .service('api::content.field-render')
                .getPdfPath(data);

            return {
                id: data.id ?? '',
                name: data.name ?? '',
                url: document,
            };
        }
        return null;
    },
    getGovernanceData: async (governanceData) => {
        const res = [];
        for (const [index, data] of governanceData.documents.entries()) {
            const documentUrl = strapi
                .service('api::content.field-render')
                .getPdfPath(data.upload);

            res[index] = {
                id: data.id,
                title: data.title,
                url: documentUrl,
            };
        }

        return {
            id: governanceData.id,
            title: governanceData.title,
            documents: res,
        };
    },
};
