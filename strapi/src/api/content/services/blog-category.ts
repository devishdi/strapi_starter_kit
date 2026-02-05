import {
    BlogCategoryRequest,
    BlogCategoryResponse,
} from '../../../../types/custom/common-type';

export default {
    getBlogCategories: async (): Promise<BlogCategoryResponse[]> => {
        const categoriesEntity = await strapi
            .query('api::blog-category.blog-category')
            .findMany({
                where: {
                    published_at: {
                        $notNull: true,
                    },
                },
                populate: {
                    icon: true,
                },
            });

        return categoriesEntity.map(
            (blog: BlogCategoryRequest): BlogCategoryResponse => {
                return strapi
                    .service('api::content.blog-category')
                    .formatBlogCategory(blog);
            }
        );
    },
    formatBlogCategory: (blog: BlogCategoryRequest): BlogCategoryResponse => {
        const icon = strapi
            .service('api::content.field-render')
            .getImage(blog.icon);

        return {
            id: blog.id,
            name: blog.name,
            categoryPage: blog.categoryPage,
            icon,
        };
    },
};
