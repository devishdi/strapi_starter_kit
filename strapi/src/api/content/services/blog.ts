import {
    MediaImage,
    BlogCategoryRequest,
    API_RESULT_FORMAT,
    BlogResponse,
    BlogWithCategoryResponse,
    Cta,
    HTTP_STATUS_SUCCESS,
} from '../../../../types/custom/common-type';

import { BLOG_LIKE, BLOG_VIEW } from './blog-api-view';

const MAX_RESULT = 9;
const MAX_BLOG_CATEGORY_RESULT = 10;

const BLOG_RESULT_FORMAT = {
    success: true,
    data: {
        list: {},
        loadMore: false,
        nextPage: 1,
    },
    status: HTTP_STATUS_SUCCESS,
};

interface BlogFilters {
    category: string;
    title?: string;
    trending?: boolean;
    order?: string;
    direction?: string;
    page?: number;
    apiRequest?: boolean;
}

interface BlogData {
    id: number;
    documentId: string;
    path: string;
    title: string;
    image: MediaImage;
    blog_categories: BlogCategoryRequest[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    short_desc: string;
    read_time: number;
    publish_date: string;
    additionalCTA: Cta;
}

export default {
    getByFilter: async ({
        category,
        title,
        trending,
        order,
        direction,
        page = 1,
        apiRequest = true,
    }: BlogFilters) => {
        const contents = BLOG_RESULT_FORMAT;
        let orderByField = 'publish_date';
        let sortDirection = 'asc';
        const queryConditions = { publishedAt: { $notNull: true } };
        const start = (page - 1) * MAX_RESULT;
        let loadMore = false;
        let nextPage = 1;
        const list = [];

        if (title) {
            queryConditions['title'] = { $containsi: title };
        }

        if (trending === true) {
            queryConditions['trending'] = true;
        }

        if (category) {
            queryConditions['blog_categories'] = { id: category };
        }

        if (['publish_date', 'title'].indexOf(order) > -1) {
            orderByField = order;
        }

        if (['asc', 'desc'].indexOf(direction) > -1) {
            sortDirection = direction;
        }

        const [blogEntity, count] = await strapi.db
            .query('api::blog.blog')
            .findWithCount({
                orderBy: { [orderByField]: sortDirection },
                where: queryConditions,
                populate: {
                    image: { populate: true },
                    blog_categories: {
                        populate: {
                            icon: true,
                        },
                    },
                },
                offset: start,
                limit: MAX_RESULT,
            });

        for (const blog of blogEntity) {
            const formattedBlog = await strapi
                .service('api::content.blog')
                .format(blog);
            list.push(formattedBlog);
        }

        if (count > page * MAX_RESULT) {
            loadMore = true;
            nextPage = ++page;
        } else {
            loadMore = false;
        }

        if (apiRequest) {
            contents.data.list = list;
            contents.data.loadMore = loadMore;
            if (nextPage > 1) {
                contents.data.nextPage = nextPage;
            }
            console.log('List:', contents);
            return contents;
        } else {
            const res = {
                list,
                loadMore,
            };
            if (nextPage > 1) {
                res['nextPage'] = nextPage;
            }
            return res;
        }
    },
    format: async (blog: BlogData): Promise<BlogResponse> => {
        const image = strapi
            .service('api::content.field-render')
            .getMediaImage(blog.image);

        const likeCount = await strapi
            .service('api::content.blog-api-view')
            .getBlogCount({ blogId: blog.id, type: BLOG_LIKE });

        const viewCount = await strapi
            .service('api::content.blog-api-view')
            .getBlogCount({ blogId: blog.id, type: BLOG_VIEW });

        return {
            id: blog.id,
            title: blog.title,
            path: blog.path,
            image,
            short_desc: blog.short_desc,
            read_time: blog.read_time,
            likeCount,
            viewCount,
            publish_date: blog.publish_date,
        };
    },
    getBlogsByCetegory: async ({ categoryId }: { categoryId: number }) => {
        const list = [];
        const whereConditions = {
            published_at: {
                $notNull: true,
            },
            blog_categories: {
                id: categoryId,
            },
            category_featured_articles: true,
        };

        const blogEntity = await strapi.db.query('api::blog.blog').findMany({
            where: whereConditions,
            populate: {
                image: { populate: true },
                additionalCTA: { populate: true },
                blog_categories: {
                    populate: {
                        icon: true,
                    },
                },
            },
            offset: 0,
            limit: MAX_BLOG_CATEGORY_RESULT,
        });

        for (const blog of blogEntity) {
            list.push(
                await strapi
                    .service('api::content.blog')
                    .formatBlogCategory(blog)
            );
        }
        return list;
    },
    formatBlogCategory: async (
        blog: BlogData
    ): Promise<BlogWithCategoryResponse> => {
        const list = [];
        const image = strapi
            .service('api::content.field-render')
            .getMediaImage(blog.image);

        const publishDate = strapi
            .service('api::content.field-render')
            .getDateWithMonthName(blog.publish_date);

        const likeCount = await strapi
            .service('api::content.blog-api-view')
            .getBlogCount({ blogId: blog.id, type: BLOG_LIKE });

        const viewCount = await strapi
            .service('api::content.blog-api-view')
            .getBlogCount({ blogId: blog.id, type: BLOG_VIEW });

        const ctaAdditional = blog.additionalCTA
            ? strapi
                  .service('api::content.field-render')
                  .getCta(blog.additionalCTA)
            : null;

        for (const category of blog.blog_categories) {
            list.push(category.name);
        }
        return {
            id: blog.id,
            title: blog.title,
            path: blog.path,
            image,
            short_desc: blog.short_desc,
            read_time: blog.read_time,
            likeCount,
            viewCount,
            publish_date: publishDate,
            additionalCTA: ctaAdditional,
            categories: list,
        };
    },
};
