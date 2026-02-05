import {
    ImageData,
    MediaImage,
    MediaType,
} from '../../../../types/custom/common-type';

export default {
    getMediaByTags: async (mediaTag: string): Promise<MediaType[]> => {
        const resData = await strapi.query('api::media.media').findMany({
            populate: {
                tag: true,
                date: true,
                media: true,
            },
            where: {
                tag: { name: mediaTag },
                published_at: {
                    $notNull: true,
                },
            },
        });

        const media = [];
        let index = 0;

        for (const item of resData) {
            if (item.media.length > 0) {
                const component = item.media[0]?.__component;
                const mediaId = item.media[0]?.id;
                switch (component) {
                    case 'corp-dynamic.media-type-video':
                        media[index] = await strapi
                            .service('api::content.media')
                            .formatVideo(mediaId);
                        break;
                    case 'corp-dynamic.media-type-document':
                        media[index] = await strapi
                            .service('api::content.media')
                            .formatDocument(mediaId);
                        break;
                    case 'corp-dynamic.media-type-audio':
                        media[index] = await strapi
                            .service('api::content.media')
                            .formatAudio(mediaId);
                        break;
                    case 'corp-dynamic.media-type-link':
                        media[index] = await strapi
                            .service('api::content.media')
                            .formatLink(mediaId);
                        break;
                    case 'corp-dynamic.media-image-type':
                        media[index] = await strapi
                            .service('api::content.media')
                            .formatImageGallery(mediaId);
                        break;
                }
                index++;
            }
        }

        return media;
    },
    formatVideo: async (id: number) => {
        const componentData = await strapi
            .query('corp-dynamic.media-type-video')
            .findOne({
                where: { id },
            });

        const displayDate = strapi
            .service('api::content.field-render')
            .formatMediaDate(componentData.displayDate);

        return {
            type: 'video',
            name: componentData.name,
            youtubeLink: componentData.youtubeLink,
            displayDate,
        };
    },
    formatAudio: async (id: number) => {
        const componentData = await strapi
            .query('corp-dynamic.media-type-audio')
            .findOne({
                where: { id },
            });

        const displayDate = strapi
            .service('api::content.field-render')
            .formatMediaDate(componentData.displayDate);

        return {
            type: 'audio',
            name: componentData.name,
            audioLink: componentData.audioLink,
            displayDate,
        };
    },
    formatDocument: async (id: number) => {
        const componentData = await strapi
            .query('corp-dynamic.media-type-document')
            .findOne({
                where: { id },
                populate: {
                    document: { populate: true },
                },
            });

        const displayDate = strapi
            .service('api::content.field-render')
            .formatMediaDate(componentData.displayDate);

        const document = strapi
            .service('api::content.field-render')
            .getPdfPath(componentData.document);

        return {
            type: 'document',
            name: componentData.name,
            document: {
                url: document,
            },
            displayDate,
        };
    },
    formatLink: async (id: number) => {
        const componentData = await strapi
            .query('corp-dynamic.media-type-link')
            .findOne({
                where: { id },
            });

        const displayDate = strapi
            .service('api::content.field-render')
            .formatMediaDate(componentData.displayDate);

        return {
            type: 'link',
            name: componentData.name,
            link: componentData.link,
            displayDate,
        };
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

        const displayDate = strapi
            .service('api::content.field-render')
            .formatMediaDate(componentData.displayDate);

        const thumbnail: MediaImage = strapi
            .service('api::content.field-render')
            .getMediaImage(componentData.thumbnail);

        const gallery = strapi
            .service('api::content.media')
            .getImageGallery(componentData.gallery);

        return {
            type: 'gallery',
            name: componentData.name,
            thumbnail,
            gallery,
            displayDate,
        };
    },
    getImageGallery: (data) => {
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
