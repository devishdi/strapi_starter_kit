import {
    TenderRequest,
    TenderResponse,
} from '../../../../types/custom/common-type';

export default {
    getTenders: async (): Promise<TenderResponse[]> => {
        const tenders = await strapi.query('api::tender.tender').findMany({
            select: [
                'rfp_number',
                'tender_status',
                'description',
                'issue_date',
                'submission_date',
            ],
            where: {
                published_at: {
                    $notNull: true,
                },
            },
            populate: {
                document: true,
            },
            orderBy: { order: 'asc' },
        });

        return strapi.service('api::content.tender').formatTender(tenders);
    },
    formatTender: (tenderData: TenderRequest[]): TenderResponse[] => {
        return tenderData.map((tender: TenderRequest): TenderResponse => {
            const document = strapi
                .service('api::content.field-render')
                .getImage(tender.document);

            return {
                number: tender.rfpNumber,
                status: tender.tenderStatus,
                description: tender.description,
                issueDate: tender.issueDate,
                submissionDate: tender.submissionDate,
                document,
            };
        });
    },
};
