import { MediaImage } from '../../../../types/custom/common-type';

export default {
    getImageGalleryTags: async () => {
        return await strapi
            .query('api::image-gallery-tag.image-gallery-tag')
            .findMany();
    },
    getImageGalleryByTag: async (galleryTag: string) => {
        const resData = await strapi
            .query('api::image-gallery.image-gallery')
            .findMany({
                populate: {
                    tag: true,
                    imageGallery: true,
                },
                where: {
                    tag: { name: galleryTag },
                    published_at: {
                        $notNull: true,
                    },
                },
            });

        const imageGallery = [];

        for (const [index, item] of resData.entries()) {
            const publishedAt = await strapi
                .service('api::content.field-render')
                .getDateWithMonthName(item.publishedAt);

            if (item.imageGallery) {
                const imageGalleryId = item.imageGallery?.id;

                imageGallery[index] = await strapi
                    .service('api::content.image-gallery')
                    .formatImageGallery(imageGalleryId);

                imageGallery[index]['publish_date'] = publishedAt;
            }
        }

        return imageGallery;
    },
    formatImageGallery: async (id: number) => {
        const componentData = await strapi
            .query('corp-dynamic.media-image-type')
            .findOne({
                where: { id },
                populate: {
                    name: { populate: true },
                    thumbnail: { populate: true },
                    gallery: {
                        populate: {
                            image: { populate: true },
                            caption: { populate: true },
                        },
                    },
                },
            });

        const thumbnail: MediaImage = strapi
            .service('api::content.field-render')
            .getMediaImage(componentData.thumbnail);

        const gallery = strapi
            .service('api::content.image-gallery')
            .getGallery(componentData.gallery);

        return {
            name: componentData.name,
            thumbnail,
            gallery,
        };
    },
    getGallery: (data) => {
        return data.map((item) => {
            const image: MediaImage = strapi
                .service('api::content.field-render')
                .getMediaImage(item.image);

            return {
                caption: item.caption,
                image,
            };
        });
    },
};
