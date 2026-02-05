import {
    RatingResponse,
    ratingViweApiParam,
    saveProductRatingApiParam,
    saveRatingDataApiParam,
} from '../../../../types/custom/common-type';

export default {
    getRatingCount: async ({
        productId,
    }: ratingViweApiParam): Promise<RatingResponse> => {
        const knex = strapi.db.connection;
        const result = await knex('product_rating')
            .sum('count as total_sum_rating')
            .avg('count as total_rating')
            .count('count as rating_count')
            .where({ product_id: productId });

        if (result.length === 0) {
            return { rating: 0, users: 0 };
        }
        return {
            rating: result[0].total_rating,
            users: result[0].rating_count,
        };
    },
    saveProductRating: async ({
        productId,
        token,
        rating,
    }: saveProductRatingApiParam): Promise<{
        success: boolean;
        data: RatingResponse;
        status: number;
    }> => {
        try {
            if (!productId) {
                throw new Error('Invalid productId provided.');
            }
            const isSaveData = await strapi
                .service('api::content.product-rating')
                .saveData({
                    productId: productId,
                    rating: rating,
                    token: token,
                });

            const countView = await strapi
                .service('api::content.product-rating')
                .getRatingCount({ productId: productId });
            return {
                success: true,
                data: {
                    rating: countView.rating,
                    users: countView.users,
                    message: 'Thanks for your Valuable feedback',
                },
                status: 200,
            };
        } catch (error) {
            return {
                success: false,
                data: {
                    rating: 0,
                    users: 0,
                    message: 'Error in saving rating',
                },
                status: 200,
            };
        }
    },
    checkSessionKeyExit: async ({
        sessionKey,
    }: {
        sessionKey: string;
    }): Promise<boolean> => {
        const knex = strapi.db.connection;

        const result = await knex('product_rating_session')
            .select('session_key')
            .where({ session_key: sessionKey });
        if (result.length === 0) {
            return false;
        }
        return true;
    },
    saveData: async ({
        productId,
        token,
        rating,
    }: saveRatingDataApiParam): Promise<boolean> => {
        try {
            const sessionKey = Buffer.from(token).toString('base64');

            const isSessionExits = await strapi
                .service('api::content.product-rating')
                .checkSessionKeyExit({ sessionKey });
            if (isSessionExits) {
                throw new Error('Session already exists.');
            }

            const knex = strapi.db.connection;
            let matrixId = 0;
            const [insertedId] = await knex('product_rating')
                .insert({ product_id: productId, count: rating })
                .returning('id');
            matrixId = insertedId;

            await knex('product_rating_session')
                .insert({ matrix_id: matrixId, session_key: sessionKey })
                .returning('id');

            return true;
        } catch (error) {
            return false;
        }
    },
    getToken: async ({
        authorization,
    }: {
        authorization: string;
    }): Promise<string> => {
        const tokenKey = authorization.split(' ');
        return tokenKey[1];
    },
};
