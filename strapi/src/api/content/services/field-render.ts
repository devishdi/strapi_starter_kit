import {
    BlockText,
    Cta,
    CtaRequest,
    ImageData,
    LabelPack,
    ListRequest,
    Media,
    MediaImage,
    MediaImageRequest,
    OptionResponse,
    Title,
    TitleRequest,
} from '../../../../types/custom/common-type';
import marked from 'marked';

/**
 * field-render service
 */
export default {
    getImage: (props: Media): ImageData => {
        const url = props?.url ? props?.url : '';
        const imageSrc = url.replace(process.env.IMAGE_REPLACE, '');
        return {
            alt: props?.alternativeText ? props?.alternativeText : '',
            title: props?.caption ? props?.caption : '',
            width: props?.width ? props?.width : 0,
            height: props?.height ? props?.height : 0,
            url: imageSrc,
        };
    },
    getImages: (imageItems: Media[]): ImageData[] => {
        return imageItems.map((mediaItem: Media): ImageData => {
            return strapi
                .service('api::content.field-render')
                .getImage(mediaItem);
        });
    },
    getMediaImage: (props: MediaImageRequest): MediaImage => {
        const desktopImage = strapi
            .service('api::content.field-render')
            .getImage(props.img_dsk);
        let mobileImage = strapi
            .service('api::content.field-render')
            .getImage(props.img_mbl);

        if (mobileImage.url === '') {
            mobileImage = desktopImage;
        }
        return { desktop: desktopImage, mobile: mobileImage };
    },
    getMediaImages: (mediaData: MediaImageRequest[]): MediaImage[] => {
        return mediaData.map((props: MediaImageRequest): MediaImage => {
            const desktopImage = strapi
                .service('api::content.field-render')
                .getImage(props.img_dsk);
            let mobileImage = strapi
                .service('api::content.field-render')
                .getImage(props.img_mbl);

            if (mobileImage.url === '') {
                mobileImage = desktopImage;
            }

            return { desktop: desktopImage, mobile: mobileImage };
        });
    },
    getCta: ({ id, title, url, opt }: CtaRequest): Cta => {
        const optionData = {
            newWindow: false,
            email: false,
            telephone: false,
            primary: false,
            secondary: false,
            ctaLink: false,
            download: false,
        };

        const options = strapi
            .service('api::content.field-render')
            .getOptions(optionData, opt);

        return { link: url, text: title, options };
    },
    getCtas: (ctaData: CtaRequest[]): Cta[] => {
        return ctaData.map((ctaItem: CtaRequest): Cta => {
            return strapi.service('api::content.field-render').getCta(ctaItem);
        });
    },
    getBlockText: (blockData: BlockText[]): string => {
        const textData: BlockText = blockData[0];
        const children = textData.children;
        return children[0].text;
    },
    getTitle: ({ id, titleTags, title }: TitleRequest): Title => {
        return { text: title, tag: titleTags };
    },
    getTitles: (titleData: TitleRequest[]): Title[] => {
        return titleData.map((titleItem: TitleRequest): Title => {
            return strapi
                .service('api::content.field-render')
                .getTitle(titleItem);
        });
    },
    getListText: (list: ListRequest[]): string[] => {
        return list.map((item) => {
            return item.text;
        });
    },
    getOptions: (
        defaultValue: OptionResponse,
        options?: string[]
    ): OptionResponse => {
        const result = defaultValue;
        if (null !== options) {
            for (const value of options) {
                result[value] = true;
            }
        }

        return result;
    },
    getDescriptionText: (text: string): string | Promise<string> => {
        return marked.parse(text);
    },
    getDateFromISOFormat: (date: string): string => {
        const dateObj = new Date(date);
        return dateObj.toISOString().split('T')[0];
    },
    getLabelPacks: (labelPackData): LabelPack[] => {
        return labelPackData.map((item): LabelPack => {
            const labelType = item.type.toLowerCase().replace(/ /g, '_');
            return { type: labelType, text: item.text };
        });
    },
    getDateWithMonthName: (date: string): string => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    },
    getPdfPath: (fileInfo: Media): string => {
        const url = fileInfo?.url ? fileInfo?.url : '';
        return url.replace(process.env.IMAGE_REPLACE, '');
    },
    replaceDomain: (
        inputText: string,
        sourceText: string,
        replaceText: string
    ): string => {
        const regex = new RegExp(sourceText, 'g');
        return inputText.replace(regex, replaceText);
    },
    formatMediaDate: (date: string): string => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', {
            year: '2-digit',
            month: 'short',
        });
    },
};
