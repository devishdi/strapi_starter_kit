import {
    Cta,
    CtaRequest,
    ImageData,
    ListRequest,
    SubComponent,
} from '../../../../types/custom/common-type';

/**
 * header service
 */
interface HeaderTextRequest {
    __component: string;
    id: number;
}

interface HeaderTextResponse {
    logo: ImageData;
    additionalLogo: ImageData;
    topMenu: Cta[];
    mainMenu?: MainMenu[];
    options?: HeaderOptions;
    profileLink?: Cta;
    breadcrumbs?: Breadcrumb;
    additionalLogoLink: string;
}

interface MainMenu {
    cta: Cta;
    tabbedView: boolean;
    level2?: Level2Menu[];
}

interface Level2Menu {
    cta: Cta;
    level3?: Level3Menu[];
}

interface Level3Menu {
    cta: Cta;
    icon: string;
    level4?: Level4Menu[];
}

interface Level4Menu {
    cta: Cta;
    benefit?: BenefitResponse;
}

interface HeaderOptions {
    language: boolean;
    search: boolean;
    profile: boolean;
}

interface BenefitRequest {
    id: number;
    title: string;
    list: ListRequest[];
    cta: CtaRequest[];
}

interface BenefitResponse {
    title: string;
    cta: Cta;
    list: string[];
}

interface Breadcrumb {
    theme: string;
    list: BreadcrumbList[];
}

interface BreadcrumbList {
    title: string;
    link: string;
    disable: boolean;
}

export default {
    renderComponent: async (
        component: HeaderTextRequest,
        id: number,
        params: object
    ): Promise<HeaderTextResponse> => {
        const componentData = await strapi.query('corp-header.c1').findOne({
            where: { id: component.id },
            populate: {
                logo: { populate: true },
                additional_logo: { populate: true },
                profile: { populate: true },
                main_menu: { populate: true },
                top_menu: { populate: true },
            },
        });

        const menuData = componentData.main_menu;
        const topMenuData = componentData.top_menu;
        const pageData = await strapi
            .service('api::content.breadcrumb')
            .getPage(id);
        const mainMenu = await strapi
            .service('api::sudlife-corp.header')
            .getMainMenu(menuData.menu);
        const logo = strapi
            .service('api::content.field-render')
            .getImage(componentData.logo);

        const additionalLogo = strapi
            .service('api::content.field-render')
            .getImage(componentData.additional_logo);

        const profileLink = componentData.profile
            ? strapi
                  .service('api::content.field-render')
                  .getCta(componentData.profile)
            : [];

        const topMenu = strapi
            .service('api::content.field-render')
            .getCtas(topMenuData.cta);

        const optionData = { language: false, search: false, profile: false };

        const options = strapi
            .service('api::content.field-render')
            .getOptions(optionData, componentData.options);

        const breadcrumb = pageData
            ? {
                  theme: pageData.breadcrumbTheme ?? 'dark',
                  list: await strapi
                      .service('api::content.breadcrumb')
                      .getData(id, true),
              }
            : null;

        return {
            logo,
            additionalLogo,
            additionalLogoLink: componentData.additional_logo_link,
            mainMenu,
            profileLink,
            topMenu,
            options,
            breadcrumbs: breadcrumb,
        };
    },
    getMainMenu: async (menuData: SubComponent[]): Promise<MainMenu[]> => {
        const result = <MainMenu[]>[];
        for (const item of menuData) {
            const level1Links = await strapi
                .service('api::sudlife-corp.header')
                .getLevel1Links(item.id);
            result.push(level1Links);
        }

        return result;
    },
    getLevel1Links: async (menuId: number): Promise<MainMenu> => {
        const result = {} as MainMenu;
        const level1Menu = await strapi
            .query('corp-subcomponent.c1-l1-link')
            .findOne({
                where: { id: menuId },
                populate: { cta: { populate: true }, link: { populate: true } },
            });

        const menuData = level1Menu.link;
        const level2Result = [];
        for (const item of menuData) {
            const level2Menu = await strapi
                .service('api::sudlife-corp.header')
                .getLevel2Menu(item.menu);
            level2Result.push(level2Menu);
        }

        result['cta'] = strapi
            .service('api::content.field-render')
            .getCta(level1Menu.cta);
        result['tabbedView'] = !!level1Menu.tabbed;

        if (level2Result.length > 0) {
            result['level2'] = level2Result;
        }

        return result;
    },
    getLevel2Menu: async (menuData: SubComponent[]): Promise<Level2Menu[]> => {
        const result = <Level2Menu[]>[];
        for (const item of menuData) {
            const level2Links = await strapi
                .service('api::sudlife-corp.header')
                .getLevel2Links(item.id);
            result.push(level2Links);
        }

        return result;
    },
    getLevel2Links: async (menuId: number): Promise<Level2Menu> => {
        const result = {} as Level2Menu;
        const level2Menu = await strapi
            .query('corp-subcomponent.c1-l2-link')
            .findOne({
                where: { id: menuId },
                populate: { cta: { populate: true }, link: { populate: true } },
            });

        const menuData = level2Menu.link;
        const level3Result = [];

        for (const item of menuData) {
            const level3Links = await strapi
                .service('api::sudlife-corp.header')
                .getLevel3Menu(item.menu);
            level3Result.push(level3Links);
        }

        result['cta'] = strapi
            .service('api::content.field-render')
            .getCta(level2Menu.cta);

        if (level3Result.length > 0) {
            result['level3'] = level3Result;
        }

        return result;
    },
    getLevel3Menu: async (menuData: SubComponent[]): Promise<Level3Menu[]> => {
        const result = <Level3Menu[]>[];
        for (const item of menuData) {
            const level1Links = await strapi
                .service('api::sudlife-corp.header')
                .getLevel3Links(item.id);
            result.push(level1Links);
        }

        return result;
    },
    getLevel3Links: async (menuId: number): Promise<Level3Menu> => {
        const result = {} as Level3Menu;
        const level3Menu = await strapi
            .query('corp-subcomponent.c1-l3-link')
            .findOne({
                where: { id: menuId },
                populate: { cta: { populate: true }, link: { populate: true } },
            });

        const menuData = level3Menu.link;
        const level4Result = [];

        for (const item of menuData) {
            const level4Links = await strapi
                .service('api::sudlife-corp.header')
                .getLevel4Menu(item.menu);
            level4Result.push(level4Links);
        }

        result['cta'] = strapi
            .service('api::content.field-render')
            .getCta(level3Menu.cta);
        const iconType = level3Menu.icon?.toLowerCase();
        result['icon'] = iconType.replace(/ /g, '_');

        if (level4Result.length > 0) {
            result['level4'] = level4Result;
        }

        return result;
    },
    getLevel4Menu: async (menuData: SubComponent[]): Promise<Level4Menu[]> => {
        const result = <Level4Menu[]>[];
        for (const item of menuData) {
            const level4Links = await strapi
                .service('api::sudlife-corp.header')
                .getLevel4Links(item.id);
            result.push(level4Links);
        }

        return result;
    },
    getLevel4Links: async (menuId: number): Promise<Level4Menu> => {
        const level4Menu = await strapi
            .query('corp-subcomponent.c1-l4-link')
            .findOne({
                where: { id: menuId },
                populate: {
                    cta: { populate: true },
                    benefit: { populate: true },
                },
            });

        const level4Cta = strapi
            .service('api::content.field-render')
            .getCta(level4Menu.cta);
        let benefit = {} as BenefitResponse;

        if (level4Menu.benefit !== null) {
            benefit = strapi
                .service('api::sudlife-corp.header')
                .getBenefits(level4Menu.benefit);
        }

        return { cta: level4Cta, benefit: benefit };
    },
    getBenefits: (benefitData: BenefitRequest): BenefitResponse => {
        return {
            title: benefitData.title,
            cta: strapi
                .service('api::content.field-render')
                .getCtas(benefitData.cta),
            list: strapi
                .service('api::content.field-render')
                .getListText(benefitData.list),
        };
    },
};
