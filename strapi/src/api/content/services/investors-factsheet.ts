import {
    ApiResponse,
    DocumentListResponse,
    API_RESULT_FORMAT,
    InvestorFactsheetApiParam,
} from '../../../../types/custom/common-type';

export default {
    getInvestoryFactsheetList: async ({
        year,
        month,
    }: InvestorFactsheetApiParam): Promise<ApiResponse> => {
        const contents = API_RESULT_FORMAT;
        const whereConditions: any = {
            published_at: {
                $notNull: true,
            },
        };

        if (year) {
            let startDate = `${year}-01-01`;
            let endDate = `${year}-12-31`;
            if (month) {
                const monthLower = month.toLowerCase();
                const monthDays = {
                    january: '31',
                    february: '29',
                    march: '31',
                    april: '30',
                    may: '31',
                    june: '30',
                    july: '31',
                    august: '31',
                    september: '30',
                    october: '31',
                    november: '30',
                    december: '31',
                };

                let monthIndex = String(
                    Object.keys(monthDays).indexOf(monthLower) + 1
                );
                if (parseInt(monthIndex) < 10) monthIndex = '0' + monthIndex;

                startDate = `${year}-${monthIndex}-01`;
                endDate = `${year}-${monthIndex}-${monthDays[monthLower]}`;
            }

            whereConditions.dacument_date = { $between: [startDate, endDate] };
        }

        const documentList = await strapi
            .query('api::investors-factsheet.investors-factsheet')
            .findMany({
                select: ['document_name', 'id'],
                populate: {
                    document: {
                        populate: true,
                    },
                },
                where: whereConditions,
                orderBy: { dacument_date: 'desc' },
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
        const result = await knex('investors_factsheets')
            .distinct(knex.raw('YEAR(dacument_date) as year'))
            .orderBy('year', 'desc');
        const years = [];
        for (const yearData of result) {
            years.push(yearData.year);
        }
        return years;
    },
};
