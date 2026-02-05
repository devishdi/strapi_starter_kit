import type { Schema, Struct } from '@strapi/strapi';

export interface DynamicStandardText extends Struct.ComponentSchema {
    collectionName: 'components_dynamic_standard_texts';
    info: {
        displayName: 'Standard Text';
    };
    attributes: {
        Text: Schema.Attribute.RichText;
        Title: Schema.Attribute.String;
    };
}

declare module '@strapi/strapi' {
    export module Public {
        export interface ComponentSchemas {
            'dynamic.standard-text': DynamicStandardText;
        }
    }
}
