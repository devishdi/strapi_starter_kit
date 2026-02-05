import { HTTP_STATUS_SUCCESS } from '../../../../types/custom/common-type';

interface FundFilters {
    fundid: string;
    product?: string;
    startdate?: string;
    enddate?: string;
    apiRequest?: boolean;
}

interface FundFilterByid {
    fundid: string;
    apiRequest?: boolean;
}

interface FundValues {
    fundid: string;
    product?: string;
    type?: string;
    apiRequest?: boolean;
}

const FUND_RESULT_FORMAT = {
    success: true,
    data: {
        list: {},
    },
    status: HTTP_STATUS_SUCCESS,
};

export default {
    getFundDetails: async ({
        fundid,
        product,
        startdate,
        enddate,
        apiRequest = true,
    }: FundFilters) => {
        const contents = FUND_RESULT_FORMAT;
        const queryConditions = {};

        if (fundid) {
            queryConditions['fund'] = { id: fundid };
        }

        if (startdate && enddate) {
            queryConditions['date'] = { $gte: startdate, $lte: enddate };
        } else if (startdate) {
            queryConditions['date'] = { $gte: startdate };
        } else if (enddate) {
            queryConditions['date'] = { $lte: enddate };
        }

        const fundNavDetails = await strapi
            .query('api::fund-nav.fund-nav')
            .findMany({
                where: queryConditions,
                populate: {
                    title: {
                        populate: true,
                    },
                    nav: {
                        populate: true,
                    },
                    date: {
                        populate: true,
                    },
                },
            });

        contents.data.list = fundNavDetails;
        return contents;
    },
    getFundDetailsById: async ({
        fundid,
        apiRequest = true,
    }: FundFilterByid) => {
        const contents = FUND_RESULT_FORMAT;
        const queryConditions = {};

        if (fundid) {
            queryConditions['id'] = { id: fundid };
        }

        const fundNavDetails = await strapi.query('api::fund.fund').findMany({
            where: {
                id: fundid,
            },
            populate: {
                title: {
                    populate: true,
                },
                display_name: {
                    populate: true,
                },
                color: {
                    populate: true,
                },
                code: {
                    populate: true,
                },
                SFIN: {
                    populate: true,
                },
                nav_products: {
                    populate: true,
                },
            },
        });

        contents.data.list = fundNavDetails;
        return contents;
    },

    getNavValue: async (id, type, startdate, enddate) => {
        const queryConditions = {};
        if (id) {
            queryConditions['fund'] = { id: id };
        }
        if (startdate && enddate) {
            queryConditions['date'] = { $gte: startdate, $lte: enddate };
        } else if (startdate) {
            queryConditions['date'] = { $gte: startdate };
        } else if (enddate) {
            queryConditions['date'] = { $lte: enddate };
        }

        const maxNavRecord = await strapi.db
            .query('api::fund-nav.fund-nav')
            .findMany({
                where: queryConditions,
                orderBy: { nav: type },
                limit: 1,
            });

        const NAV = maxNavRecord.length > 0 ? maxNavRecord[0].nav : null;
        const date = maxNavRecord.length > 0 ? maxNavRecord[0].date : null;
        return { nav: NAV, date: date };
    },
    getFundNavValue: async ({
        fundid,
        product,
        type,
        apiRequest = true,
    }: FundValues) => {
        const contents = FUND_RESULT_FORMAT;
        const data = {};
        const enddate = new Date().toISOString().split('T')[0];
        const weeksAgo = new Date();
        let dateOnly = new Date().toISOString().split('T')[0];
        if (type == '1m') {
            weeksAgo.setDate(weeksAgo.getDate() - 30);
            dateOnly = weeksAgo.toISOString().split('T')[0];
        } else if (type == '1y') {
            weeksAgo.setDate(weeksAgo.getDate() - 365);
            dateOnly = weeksAgo.toISOString().split('T')[0];
        } else if (type == '3y') {
            weeksAgo.setDate(weeksAgo.getDate() - 1095);
            dateOnly = weeksAgo.toISOString().split('T')[0];
        } else if (type == '5y') {
            weeksAgo.setDate(weeksAgo.getDate() - 1825);
            dateOnly = weeksAgo.toISOString().split('T')[0];
        } else {
            weeksAgo.setDate(weeksAgo.getDate() - 364);
            dateOnly = weeksAgo.toISOString().split('T')[0];
        }
        data['fund'] = { id: fundid };
        data['max'] = {
            max: await strapi
                .service('api::content.fund-nav')
                .getNavValue(fundid, 'desc', dateOnly, enddate),
        };
        data['min'] = {
            min: await strapi
                .service('api::content.fund-nav')
                .getNavValue(fundid, 'asc', dateOnly, enddate),
        };

        contents.data.list = data;
        return contents;
    },
};
