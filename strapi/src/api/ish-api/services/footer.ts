import {
    MediaImage,
    ImageData,
    Cta,
    StickyModuleData,
} from '../../../../types/custom/common-type';

/**
 * footer service
 */
interface FooterTextResponse {
    logo: MediaImage;
    productMenu: ColumnData;
    quickLinks: ColumnData;
    importantLinks: MenuData;
    otherLinks: MenuData;
    followUs: FollowUsData;
    disclaimer: TextData;
    infoSection: InfoSectionData;
    copyright: string;
    stickyModule: StickyModuleData[];
}

interface FooterTextRequest {
    __component: string;
    id: number;
}

interface IconsData {
    type: string;
    icon: ImageData;
    link: string;
}

interface ColumnData {
    title: string;
    column: MenuData[];
}

interface MenuData {
    title: string;
    link?: string;
    menuItem: Cta[];
}

interface FollowUsData {
    title: string;
    socialIcons: IconsData[];
    portalLogo: ImageData;
    portalLogoLink: string;
}

interface TextData {
    title: string;
    description: string;
}

interface InfoSectionData {
    column: TextData[];
    description: string;
}

export default {
    renderComponent: async (
        component: FooterTextRequest,
        id: number,
        params: object
    ): Promise<FooterTextResponse> => {
        const footerData = await strapi.query('corp-footer.c2').findOne({
            where: {
                id: component.id,
            },
            populate: {
                logo: { populate: true },
                productMenu: {
                    populate: {
                        title: { populate: true },
                        link: { populate: true },
                        column: {
                            populate: {
                                menu: { populate: true },
                            },
                        },
                    },
                },
                quickLinks: {
                    populate: {
                        title: { populate: true },
                        link: { populate: true },
                        column: {
                            populate: {
                                menu: { populate: true },
                            },
                        },
                    },
                },
                importantLinks: { populate: true },
                otherLinks: { populate: true },
                followUs: {
                    populate: {
                        portalLogo: { populate: true },
                        socialIcons: { populate: true },
                    },
                },
                disclaimer: { populate: true },
                infoSection: { populate: true },
                copyright: { populate: true },
                stickyModule: { populate: true },
            },
        });

        const logo = footerData.logo
            ? strapi
                  .service('api::content.field-render')
                  .getMediaImage(footerData.logo)
            : {};

        const productMenu = {
            title: footerData.productMenu?.title,
            column: footerData.productMenu?.column
                ? await strapi
                      .service('api::sudlife-corp.footer')
                      .getColumnData(footerData.productMenu.column)
                : [],
        };

        const quickLinks = {
            title: footerData.quickLinks?.title,
            column: footerData.quickLinks?.column
                ? await strapi
                      .service('api::sudlife-corp.footer')
                      .getColumnData(footerData.quickLinks.column)
                : [],
        };

        const importantLinks = {
            title: footerData.importantLinks?.title,
            menuItem: footerData.importantLinks.menuItem
                ? strapi
                      .service('api::content.field-render')
                      .getCtas(footerData.importantLinks.menuItem)
                : [],
        };

        const otherLinks = {
            title: footerData.otherLinks?.title,
            menuItem: footerData.otherLinks?.links
                ? strapi
                      .service('api::content.field-render')
                      .getCtas(footerData.otherLinks.links)
                : [],
        };

        const followUs = {
            title: footerData.followUs?.title,
            socialIcons: footerData.followUs?.socialIcons
                ? await strapi
                      .service('api::sudlife-corp.footer')
                      .getSocialMediaIcons(footerData.followUs.socialIcons)
                : [],
            portalLogo: footerData.followUs?.portalLogo
                ? strapi
                      .service('api::content.field-render')
                      .getImage(footerData.followUs.portalLogo)
                : {},
            portalLogoLink: footerData.followUs?.portalLogoLink,
        };

        const disclaimer = {
            title: footerData.disclaimer?.title,
            description: footerData.disclaimer?.description,
        };

        const infoSection = {
            column: footerData.infoSection?.sectionColumn.map(
                (data): TextData => {
                    return {
                        title: data?.title,
                        description: data?.description,
                    };
                }
            ),
            description: footerData.infoSection?.description,
        };

        const stickyModule = footerData.stickyModule.map(
            (data): StickyModuleData => {
                const icon = strapi
                    .service('api::content.field-render')
                    .getImage(data.icon);

                const cta = strapi
                    .service('api::content.field-render')
                    .getCta(data.cta);

                return {
                    icon,
                    cta,
                };
            }
        );

        return {
            logo,
            productMenu,
            quickLinks,
            importantLinks,
            otherLinks,
            followUs,
            disclaimer,
            infoSection,
            copyright: footerData.copyright,
            stickyModule,
        };
    },
    getColumnData: async (columnData) => {
        return columnData.map((column) => {
            return column.menu.map((data): MenuData => {
                const menuItem = strapi
                    .service('api::content.field-render')
                    .getCtas(data.menuItem);

                return {
                    title: data.title,
                    link: data.link,
                    menuItem,
                };
            });
        });
    },
    getSocialMediaIcons: async (socialIcons) => {
        return socialIcons.map((data): IconsData => {
            const icon = strapi
                .service('api::content.field-render')
                .getImage(data.icon);

            return {
                type: data.type,
                icon: icon,
                link: data.link,
            };
        });
    },
};
