import {
    InvestorCategoryResponse,
    ApiResponse,
    InvestorCategoryApiParam,
    DocumentListResponse,
    API_RESULT_FORMAT,
} from '../../../../types/custom/common-type';

export default {
    getInvestorCategory: async (
        id: number
    ): Promise<InvestorCategoryResponse[]> => {
        const investorCategory = await strapi
            .query('api::investors-category.investors-category')
            .findMany({
                select: [
                    'display_format',
                    'show_filter_quarterly',
                    'investor_category',
                    'id',
                ],
                where: {
                    published_at: {
                        $notNull: true,
                    },
                },
            });

        return investorCategory;
    },

    getInvestoryDocumentList: async ({
        category,
        year,
        quarter,
    }: InvestorCategoryApiParam): Promise<ApiResponse> => {
        const contents = API_RESULT_FORMAT;

        const whereConditions: any = {
            published_at: {
                $notNull: true,
            },
            investors_category: {
                id: category,
            },
        };

        if (year) {
            const [startYear, endYear] = year.split('-');
            whereConditions.document_date = {
                $between: [`${startYear}-04-01`, `${endYear}-03-31`],
            };
        }
        if (quarter && year) {
            const [startYear, endYear] = year.split('-');
            if (quarter === 'quarter1') {
                whereConditions.document_date = {
                    $between: [`${startYear}-04-01`, `${startYear}-06-30`],
                };
            } else if (quarter === 'quarter2') {
                whereConditions.document_date = {
                    $between: [`${startYear}-07-01`, `${startYear}-09-30`],
                };
            } else if (quarter === 'quarter3') {
                whereConditions.document_date = {
                    $between: [`${startYear}-10-01`, `${startYear}-12-31`],
                };
            } else if (quarter === 'quarter4') {
                whereConditions.document_date = {
                    $between: [`${endYear}-01-01`, `${endYear}-03-31`],
                };
            }
        }

        const documentList = await strapi
            .query('api::investors-document.investors-document')
            .findMany({
                select: ['document_name', 'id'],
                populate: {
                    investors_category: {
                        populate: true,
                    },
                    document: {
                        populate: true,
                    },
                },
                where: whereConditions,
                orderBy: { document_date: 'desc' },
            });
        contents.data = strapi
            .service('api::content.investors-landing')
            .formatDocument(documentList);

        return contents;
    },
    formatDocument: (documentList: any[]): DocumentListResponse[] => {
        return documentList.map((documentInfo: any): DocumentListResponse => {
            const filePath = strapi
                .service('api::content.field-render')
                .getPdfPath(documentInfo.document);

            return {
                document_name: documentInfo.document_name,
                id: documentInfo.id,
                file_path: filePath,
            };
        });
    },
    getDocumnetYear: async (): Promise<any[]> => {
        const knex = strapi.db.connection;
        const result = await knex('investors_documents')
            .distinct(
                knex.raw('YEAR(document_date) as year'),
                knex.raw('MONTH(document_date) as month')
            )
            .orderBy([
                { column: 'year', order: 'desc' },
                { column: 'month', order: 'desc' },
            ]);

        return strapi
            .service('api::content.investors-landing')
            .formatFinancialYear(result);
    },

    formatFinancialYear: (documentList: any[]): any[] => {
        const documentYear = [];
        let finacialYear = '';
        for (const yearMonth of documentList) {
            if (yearMonth.month > 3) {
                finacialYear = `${yearMonth.year}-${yearMonth.year + 1}`;
            } else {
                finacialYear = `${yearMonth.year - 1}-${yearMonth.year}`;
            }

            if (!documentYear.includes(finacialYear))
                documentYear.push(finacialYear);
        }
        return documentYear;
    },
};
