import { BranchResponse } from '../../../../types/custom/common-type';

export default {
    branchExists: async (slug: string): Promise<boolean> => {
        const entity = await strapi.db.query('api::branch.branch').findOne({
            where: {
                slug,
                published_at: {
                    $notNull: true,
                },
            },
        });

        if (entity?.id) {
            return true;
        } else {
            return false;
        }
    },
    getBranchBySlug: async (slug: string): Promise<BranchResponse> => {
        const branch = await strapi.query('api::branch.branch').findOne({
            where: {
                slug,
                published_at: {
                    $notNull: true,
                },
            },
            populate: {
                coordinates: { populate: true },
                banner: {
                    populate: {
                        image: { populate: true },
                    },
                },
                amenities: { populate: true },
                amenitiesBgImage: { populate: true },
            },
        });

        return await strapi.service('api::content.branch').formatBranch(branch);
    },
    formatBranch: async (branch): Promise<BranchResponse> => {
        const bannerImage = branch.banner
            ? await strapi
                  .service('api::content.field-render')
                  .getMediaImage(branch.banner.image)
            : null;

        const banner =
            branch.banner !== null
                ? {
                      image: bannerImage,
                      title: branch.banner.title ?? '',
                      subTitle: branch.banner.subTitle ?? '',
                  }
                : null;

        const amenitiesBgImage = branch.amenitiesBgImage
            ? await strapi
                  .service('api::content.field-render')
                  .getMediaImage(branch.amenitiesBgImage)
            : null;

        const coordinates =
            branch.coordinates !== null
                ? {
                      latitude: branch.coordinates.latitude ?? '',
                      longitude: branch.coordinates.longitude ?? '',
                  }
                : null;

        const amenities = branch.amenities.map((data) => {
            return {
                type: data.type,
                text: data.text,
            };
        });

        return {
            name: branch.name,
            slug: branch.slug,
            address: branch.address,
            locality: branch.locality,
            coordinates,
            banner,
            amenitiesTitle: branch.amenitiesTitle,
            amenitiesBgImage,
            amenities,
        };
    },
};
