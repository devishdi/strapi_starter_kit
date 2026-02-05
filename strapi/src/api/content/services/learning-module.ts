import {
    TopicData,
    VideoModule,
    CardModule,
    OtherTopicData,
} from '../../../../types/custom/common-type';

export default {
    getListByTags: async (
        moduleId: number,
        exceptId = 0
    ): Promise<TopicData[]> => {
        const filters = {
            module: { id: moduleId },
            publishedAt: { $notNull: true },
        };

        if (exceptId !== 0) {
            filters['id'] = { $ne: exceptId };
        }

        const resData = await strapi
            .query('api::learning-module.learning-module')
            .findMany({
                populate: {
                    module: true,
                    thumbnail: { populate: true },
                    detailComponent: true,
                },
                where: { ...filters },
                orderBy: { number: 'asc' },
            });

        const result = [];
        for (const [index, item] of resData.entries()) {
            const component = item.detailComponent[0]?.__component;
            const detailId = item.detailComponent[0]?.id;
            const thumbnail = item.thumbnail
                ? strapi
                      .service('api::content.field-render')
                      .getMediaImage(item.thumbnail)
                : null;

            let video = [];

            if (component === 'corp-dynamic.lm-video') {
                video = await strapi
                    .service('api::content.learning-module')
                    .getVideo(detailId);
            }

            result[index] = {
                topicNumber: item?.number ?? 0,
                type: item?.type,
                title: item?.title,
                ...(item.type !== 'video' ? { path: item.path } : null),
                thumbnail,
                ...(video ?? null),
                publishedDate: await strapi
                    .service('api::content.field-render')
                    .formatMediaDate(item.publishedAt),
            };
        }

        return result;
    },
    getVideo: async (id: number): Promise<VideoModule> => {
        const componentData = await strapi
            .query('corp-dynamic.lm-video')
            .findOne({
                where: { id },
                populate: {
                    video: { populate: true },
                },
            });

        const video = strapi
            .service('api::content.field-render')
            .getImage(componentData.video);

        return {
            description: componentData.description,
            video,
        };
    },
    getDetails: async (id: number): Promise<TopicData> => {
        const lmData = await strapi
            .query('api::learning-module.learning-module')
            .findOne({
                populate: {
                    tag: true,
                    thumbnail: { populate: true },
                    detailComponent: true,
                },
                where: {
                    id,
                    published_at: {
                        $notNull: true,
                    },
                },
            });

        const thumbnail = lmData.thumbnail
            ? strapi
                  .service('api::content.field-render')
                  .getMediaImage(lmData.thumbnail)
            : null;

        const details = lmData.detailComponent
            ? await strapi
                  .service('api::content.learning-module')
                  .getCardsData(lmData.detailComponent[0].id)
            : null;

        return {
            topicNumber: lmData?.number ?? 0,
            type: lmData?.type,
            title: lmData?.title,
            path: lmData?.path,
            thumbnail,
            details,
        };
    },
    getCardsData: async (id: number): Promise<CardModule[]> => {
        const list = await strapi.query('corp-dynamic.lm-cards').findOne({
            populate: {
                cards: {
                    populate: {
                        image: { populate: true },
                    },
                },
            },
            where: { id },
        });

        const res = [];
        for (const [index, card] of list.cards.entries()) {
            const image = card.image
                ? strapi
                      .service('api::content.field-render')
                      .getMediaImage(card.image)
                : null;

            res[index] = {
                variation: card.cardVariation,
                colour: card.cardColour,
                fontColour: card.fontColour,
                number: card.number,
                numberBgColour: card.numberBgColour,
                title: card.title,
                description: card.description,
                imagePosition: card.imagePosition,
                quote: card.quote,
                image,
            };
        }

        return res;
    },
    getOtherTopics: async (topicId: number): Promise<OtherTopicData> => {
        let list = [];
        const lmData = await strapi
            .query('api::learning-module.learning-module')
            .findOne({
                populate: {
                    module: true,
                },
                where: {
                    id: topicId,
                },
            });

        if (lmData?.module?.id) {
            list = lmData.module.id
                ? await strapi
                      .service('api::content.learning-module')
                      .getListByTags(lmData.module.id, topicId)
                : null;
        }

        return {
            number: lmData?.module?.number,
            module: lmData?.module?.name,
            list,
        };
    },
};
