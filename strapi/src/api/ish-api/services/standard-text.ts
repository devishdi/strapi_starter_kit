import { Cta, Title } from '../../../../types/custom/common-type';

/**
 * str service
 */
interface StandardTextResponse {
    title: Title;
    description: string;
    cta: Cta;
}

interface StandardTextRequest {
    __component: string;
    id: number;
}
export default {
    renderComponent: async (
        component: StandardTextRequest,
        id: number,
        params: object
    ): Promise<StandardTextResponse> => {
        const componentData = await strapi.query('corp-dynamic.c3').findOne({
            where: { id: component.id },
            populate: {
                titleTags: { populate: true },
                cta: { populate: true },
            },
        });
        const titleData = componentData.titleTags
            ? strapi
                  .service('api::content.field-render')
                  .getTitle(componentData.titleTags)
            : null;
        const cta = componentData.cta
            ? strapi
                  .service('api::content.field-render')
                  .getCta(componentData.cta)
            : null;
        return {
            title: titleData,
            description: componentData.description,
            cta: cta,
        };
    },
};
