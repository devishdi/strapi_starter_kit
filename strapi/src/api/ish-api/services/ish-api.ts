import components from '../../../../components/sudlife-corp.json';
import {
    PageRequest,
    PageResponse,
} from '../../../../types/custom/common-type';

/**
 * content service
 */
export default {
    renderContent: async ({
        site,
        path,
        params,
    }: PageRequest): Promise<PageResponse> => {
        try {
            return await strapi.service('api::content.content').renderContent({
                components,
                site,
                path,
                params,
            });
        } catch (err) {
            return {
                success: false,
                data: {
                    app: {
                        imageBasePath: '',
                        language: '',
                        homeUrl: '',
                    },
                    info: {
                        path: '',
                        pageTitle: '',
                        pageId: '',
                        product: {},
                        metaTags: {},
                    },
                    components: {},
                },
                status: 403,
            };
        }
    },
};
