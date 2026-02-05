import {
    AuthorRequest,
    AuthorResponse,
} from '../../../../types/custom/common-type';

export default {
    getAuthor: ({
        id,
        name,
        rating,
        image,
        title,
        description,
    }: AuthorRequest): AuthorResponse => {
        const authorImage = strapi
            .service('api::content.field-render')
            .getImage(image);

        return { name, rating, image: authorImage, title, description };
    },
    getAuthors: (authorData: AuthorRequest[]): AuthorResponse[] => {
        return authorData.map((author: AuthorRequest): AuthorResponse => {
            return strapi.service('api::content.author').getAuthor(author);
        });
    },
};
