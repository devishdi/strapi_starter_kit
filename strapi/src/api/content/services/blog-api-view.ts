import {
    BlogLikeResponse,
    blogViweApiParam,
    saveBlogLikeApiParam,
    saveBlogDataApiParam,
    API_RESULT_FORMAT,
    API_RESULT_FAIL,
} from '../../../../types/custom/common-type';

export const BLOG_LIKE: string = 'like';
export const BLOG_VIEW: string = 'view';

export default {
    getBlogCount: async ({
        blogId,
        type,
    }: blogViweApiParam): Promise<BlogLikeResponse> => {
        const knex = strapi.db.connection;
        const result = await knex('blog_matrix')
            .select('id', 'count')
            .where({ blog_id: blogId, type: type });
        if (result.length === 0) {
            return { count: 0 };
        }
        return { count: result[0].count, id: result[0].id };
    },
    saveBlogLike: async ({
        blogId,
        token,
    }: saveBlogLikeApiParam): Promise<{ success: boolean }> => {
        const contents = API_RESULT_FORMAT;
        const contentFail = API_RESULT_FAIL;
        try {
            if (!blogId || blogId <= 0) {
                throw new Error('Invalid blogId provided.');
            }
            const isSaveData = await strapi
                .service('api::content.blog-api-view')
                .saveData({ blogId: blogId, type: BLOG_LIKE, token: token });

            contents.data = isSaveData;
            return contents;
        } catch (error) {
            console.error('Error saving blog like:', error);
            contentFail.data = false;
            return contentFail;
        }
    },
    checkSessionKeyExit: async ({
        sessionKey,
    }: {
        sessionKey: string;
    }): Promise<boolean> => {
        const knex = strapi.db.connection;

        const result = await knex('blog_matrix_session')
            .select('session_key')
            .where({ session_key: sessionKey });
        if (result.length === 0) {
            return false;
        }
        return true;
    },
    saveBlogView: async ({
        blogId,
        token,
    }: saveBlogLikeApiParam): Promise<{ success: boolean }> => {
        const contents = API_RESULT_FORMAT;
        const contentFail = API_RESULT_FAIL;
        try {
            if (!blogId || blogId <= 0) {
                throw new Error('Invalid blogId provided.');
            }

            const isSaveData = await strapi
                .service('api::content.blog-api-view')
                .saveData({ blogId: blogId, type: BLOG_VIEW, token: token });

            contents.data = isSaveData;
            return contents;
        } catch (error) {
            console.error('Error saving blog like:', error);
            contentFail.data = false;
            return contentFail;
        }
    },
    saveData: async ({
        blogId,
        type,
        token,
    }: saveBlogDataApiParam): Promise<boolean> => {
        try {
            const sessionKey = Buffer.from(token).toString('base64');

            const isSessionExits = await strapi
                .service('api::content.blog-api-view')
                .checkSessionKeyExit({ sessionKey });
            if (isSessionExits) {
                throw new Error('Session already exists.');
            }
            const countView = await strapi
                .service('api::content.blog-api-view')
                .getBlogCount({ blogId: blogId, type: type });
            let matrixId = 0;
            const knex = strapi.db.connection;

            if (countView.count === 0) {
                const [insertedId] = await knex('blog_matrix')
                    .insert({ blog_id: blogId, type: type, count: 1 })
                    .returning('id');
                matrixId = insertedId;
            } else {
                const updatedRows = await knex('blog_matrix')
                    .where({ id: countView.id })
                    .update({
                        count: countView.count + 1,
                    });
                matrixId = countView.id;
            }
            await knex('blog_matrix_session')
                .insert({ matrix_id: matrixId, session_key: sessionKey })
                .returning('id');

            return true;
        } catch (error) {
            console.error('Error saving blog like:', error);
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
