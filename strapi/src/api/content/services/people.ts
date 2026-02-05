import {
    PeopleRequest,
    PeopleResponse,
    DesignationResponse,
} from '../../../../types/custom/common-type';

export default {
    getItem: ({
        name,
        image,
        description,
        designation,
        linkedIn,
        cta,
        qualifications,
        experience,
        quote,
    }: PeopleRequest): PeopleResponse => {
        const mediaImage = image
            ? strapi.service('api::content.field-render').getMediaImage(image)
            : null;

        const ctaLink = cta
            ? strapi.service('api::content.field-render').getCta(cta)
            : null;

        const peopleDesignation = designation.map(
            (data): DesignationResponse => {
                const text = data.designation.text;

                return {
                    role: data.role,
                    text,
                };
            }
        );

        return {
            name,
            image: mediaImage,
            description,
            designation: peopleDesignation,
            linkedIn,
            cta: ctaLink,
            qualifications: qualifications ?? '',
            experience: experience ?? '',
            quote: quote ?? '',
        };
    },
    getPeople: (peopleData: PeopleRequest[]): PeopleResponse[] => {
        return peopleData.map((people: PeopleRequest): PeopleResponse => {
            return strapi.service('api::content.people').getItem(people);
        });
    },
};
