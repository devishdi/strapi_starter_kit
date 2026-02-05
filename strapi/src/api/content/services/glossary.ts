import {
    GlossaryApiResponse,
    GlossaryResponse,
    MAX_RESULT_GLOSSARY,
    API_RESULT_FORMAT,
    ApiResponse,
} from '../../../../types/custom/common-type';

export default {
    getGlossariesByPlanId: async (id: number): Promise<GlossaryResponse[]> => {
        const glossaries = await strapi
            .query('api::glossary.glossary')
            .findMany({
                select: ['id', 'keyword', 'description'],
                where: {
                    categories: {
                        id,
                    },
                },
                limit: MAX_RESULT_GLOSSARY,
            });
        return glossaries;
    },
};
