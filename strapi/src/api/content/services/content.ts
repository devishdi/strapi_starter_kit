import {
    HTTP_STATUS_NOTFOUND,
    HTTP_STATUS_SUCCESS,
    PageDataRequest,
    PageResponse,
    Media,
} from '../../../../types/custom/common-type';
import { env } from '@strapi/utils';

interface ComponentData {
    renderData: [{ __component: string | number; id: number }];
    componentResult: object;
    components: object;
    pageId: number;
    params: string;
    site: string;
}

interface MetaTagsRequest {
    __component: string;
    id: number;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    metaRobots?: string;
    structuredData?: string;
    metaViewport?: string;
    canonicalURL?: string;
    shortlink?: string;
    opengraph?: OpengraphRequest;
}

interface OpengraphRequest {
    id: number;
    title?: string;
    description?: string;
    image?: Media;
}

interface MetaDataResponse {
    title: string;
    description: string;
    canonical?: string;
    og_title?: string;
    og_description?: string;
    og_image?: Media;
    robots?: string;
    keywords?: string;
    shortLink?: string;
    structuredData?: string;
}

/**
 * content service
 */
export default {
    renderContent: async ({
        components,
        site,
        path,
        params,
    }: PageDataRequest): Promise<PageResponse> => {
        const contents: PageResponse = {
            success: true,
            data: {
                app: {
                    imageBasePath: env('IMAGE_BASE_PATH'),
                    language: 'en',
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

        try {
            const commonApi = 'api::corp-common.corp-common';
            const commonResult = await strapi.db.query(commonApi).findOne({
                populate: {
                    cmp_header: true,
                    cmp_footer: true,
                },
            });

            console.log('Error on callig -5');

            const PAGE404 = commonResult.page_404;

            if (path.search('^/branch+[/]{0,1}$') === 0) {
                path = PAGE404;
            } else if (path.search('^/branch/+[^W]+$') === 0) {
                const branchSlug = path.split('/branch/').pop();

                const isBranchExists = await strapi
                    .service('api::content.branch')
                    .branchExists(branchSlug);

                if (isBranchExists) {
                    if (params) {
                        const obj1 = JSON.parse(params);
                        obj1.slug = branchSlug;
                        params = JSON.stringify(obj1);
                    } else {
                        params = JSON.stringify({
                            slug: branchSlug,
                        });
                    }

                    path = '/branch';
                } else {
                    path = PAGE404;
                }
            }

            console.log('Error on callig -4');

            if (typeof PAGE404 !== 'string' || path === PAGE404) {
                return contents;
            }

            const pageData = await strapi
                .service('api::content.content')
                .getPage(site, path, PAGE404);

            contents.data.info.path = path;
            contents.data.info.pageTitle = pageData.title;
            contents.data.info.pageId = pageData.id;
            if (pageData.linkedProduct) {
                contents.data.info.product = {
                    id: pageData.linkedProduct.id,
                    productId: pageData.linkedProduct.productId,
                    title: pageData.linkedProduct.title,
                };
            }
            contents.data.info.metaTags = pageData.cmp_meta
                ? await strapi
                      .service('api::content.content')
                      .buildMetaTags(pageData.cmp_meta)
                : {};
            contents.data.components = {};
            let paramsData = {};
            console.log('Error on callig -6');
            if (params) {
                paramsData = JSON.parse(params);
            }

            console.log('Error on callig -2');

            const headerComponents = await strapi
                .service('api::content.content')
                .setComponent({
                    renderData: commonResult.cmp_header,
                    componentResult: {},
                    components: components,
                    pageId: pageData.id,
                    params: paramsData,
                    site,
                });
            console.log('Error on callig -7');
            const pageComponents = await strapi
                .service('api::content.content')
                .setComponent({
                    renderData: pageData.cmp_dynamic,
                    componentResult: headerComponents,
                    components: components,
                    pageId: pageData.id,
                    params: paramsData,
                    site,
                });
            console.log('Error on callig -8');
            contents.data.components = await strapi
                .service('api::content.content')
                .setComponent({
                    renderData: commonResult.cmp_footer,
                    componentResult: pageComponents,
                    components: components,
                    pageId: pageData.id,
                    params: paramsData,
                    site,
                });
            console.log('Error on callig -9');
            contents.status = HTTP_STATUS_SUCCESS;
            return contents;
        } catch (err) {
            console.log('Error on callig', err);
            contents.status = HTTP_STATUS_NOTFOUND;
            return contents;
        }
    },
    getComponentKey: (componentKeys: string[], sectionName: string): string => {
        let i = 1;
        let sectionKey = '';
        while (i > 0) {
            sectionKey = sectionName + '_' + i;
            if (componentKeys.indexOf(sectionKey) !== -1) {
                i = i + 1;
            } else {
                i = 0;
            }
        }

        return sectionKey;
    },
    setComponent: async ({
        renderData,
        componentResult,
        components,
        pageId,
        params,
        site,
    }: ComponentData) => {
        if (renderData.length <= 0) {
            return componentResult;
        }
        for (let componentObj of renderData) {
            if (componentObj.__component === 'corp-dynamic.shared-component') {
                const sharedComponent = await strapi
                    .service('api::content.content')
                    .getSharedContent(componentObj);

                if (sharedComponent) {
                    componentObj = sharedComponent.components[0];
                } else {
                    continue;
                }
            }

            if (
                site === 'intranet' &&
                (componentObj.__component === 'corp-header.c1' ||
                    componentObj.__component === 'corp-footer.c2')
            ) {
                continue;
            }

            let componentKey = components[componentObj.__component]['key'];
            const componentService =
                components[componentObj.__component]['service'];

            componentKey = strapi
                .service('api::content.content')
                .getComponentKey(Object.keys(componentResult), componentKey);
            componentResult[componentKey] = await strapi
                .service(componentService)
                .renderComponent(componentObj, pageId, params);
        }

        return componentResult;
    },
    getPage: async (site: string, path: string, pageNotFound: string) => {
        let pageApi = 'api::corp-page.corp-page';
        if (site === 'intranet') {
            pageApi = 'api::intranet-page.intranet-page';
        }

        const pageCollections = [
            pageApi,
            'api::blog.blog',
            'api::learning-module.learning-module',
        ];
        let pageResult = {};

        for (const collection of pageCollections) {
            pageResult = await strapi.db.query(collection).findOne({
                where: {
                    path: path,
                    published_at: {
                        $notNull: true,
                    },
                },
                populate: {
                    cmp_dynamic: true,
                    cmp_meta: {
                        populate: { opengraph: { populate: { image: true } } },
                    },
                    linkedProduct: true,
                },
            });

            if (pageResult) {
                break;
            }
        }

        if (!pageResult || Object.keys(pageResult).length <= 0) {
            pageResult = await strapi.db.query(pageApi).findOne({
                where: {
                    path: pageNotFound,
                },
                populate: {
                    cmp_dynamic: true,
                },
            });
        }

        return pageResult;
    },
    buildMetaTags: async (metaTags: MetaTagsRequest[]) => {
        const metaData: MetaDataResponse = {
            title: '',
            description: '',
            canonical: '',
            robots: '',
            keywords: '',
            shortLink: '',
            structuredData: '',
            og_title: '',
            og_description: '',
            og_image: null,
        };

        if (metaTags.length > 0) {
            const metaTagData = metaTags[0];

            let imageData = null;

            if (
                metaTagData.opengraph !== null &&
                metaTagData.opengraph.image !== null
            ) {
                imageData = strapi
                    .service('api::content.field-render')
                    .getImage(metaTagData.opengraph.image);

                imageData.url = env('IMAGE_BASE_PATH') + imageData.url;
            }

            metaData.title = metaTagData.metaTitle;
            metaData.description = metaTagData.metaDescription;
            metaData.canonical = metaTagData.canonicalURL;
            metaData.og_title = metaTagData.opengraph
                ? metaTagData.opengraph.title
                : '';
            metaData.og_description = metaTagData.opengraph
                ? metaTagData.opengraph.description
                : '';
            metaData.og_image = imageData;
            metaData.robots = metaTagData.metaRobots;
            metaData.keywords = metaTagData.keywords;
            metaData.shortLink = metaTagData.metaRobots;
            metaData.structuredData = metaTagData.structuredData;
        }

        return metaData;
    },
    getSharedContent: async (componentObj) => {
        const sharedComponent = await strapi
            .service('api::content.content')
            .getSharedComponent(componentObj);

        let sharedContent = null;
        if (sharedComponent['content']) {
            sharedContent = await strapi
                .query('api::shared-component.shared-component')
                .findOne({
                    populate: {
                        components: true,
                    },
                    where: {
                        id: sharedComponent['content'].id,
                        published_at: {
                            $notNull: true,
                        },
                    },
                });
        }

        return sharedContent;
    },
    getSharedComponent: async (componentObj) => {
        return await strapi.query(componentObj.__component).findOne({
            where: { id: componentObj.id },
            populate: {
                content: true,
            },
        });
    },
    formatJobList: async (jobList) => {
        const result = await jobList.data.map((job) => {
            if (job.post_on_careers_page === 1) {
                return job;
            }
        });

        return result;
    },
    isUniquePath: async (path: string, isPublished: boolean, updateId = 0) => {
        const filters = { publishedAt: { $notNull: isPublished } };

        if (updateId > 0) {
            filters['id'] = { $ne: updateId };
        }

        const branch = await strapi.query('api::branch.branch').findOne({
            where: { ...filters, slug: path },
        });
        const blog = await strapi.query('api::blog.blog').findOne({
            where: { ...filters, path: path },
        });
        const lm = await strapi
            .query('api::learning-module.learning-module')
            .findOne({
                where: { ...filters, path: path },
            });
        const corpPage = await strapi
            .query('api::corp-page.corp-page')
            .findOne({
                where: { ...filters, path: path },
            });

        if (branch || blog || lm || corpPage) {
            return false;
        }

        return true;
    },
    isUniqueIntranetPath: async (
        path: string,
        isPublished: boolean,
        updateId = 0
    ) => {
        const filters = { publishedAt: { $notNull: isPublished } };

        if (updateId > 0) {
            filters['id'] = { $ne: updateId };
        }

        const intranetPage = await strapi
            .query('api::intranet-page.intranet-page')
            .findOne({
                where: { ...filters, path: path },
            });

        if (intranetPage) {
            return false;
        }

        return true;
    },
};
