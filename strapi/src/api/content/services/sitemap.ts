import {
    HTTP_STATUS_NOTFOUND,
    HTTP_STATUS_SUCCESS,
    PageDataRequest,
    PageResponse,
    Media,
} from '../../../../types/custom/common-type';
import { env } from '@strapi/utils';
import { create, fragment } from 'xmlbuilder2';
import knex from 'knex';

/**
 * content service
 */
export default {
    renderContent: async (): Promise<string> => {
        try {
            const knex = strapi.db.connection;
            const result = await knex('corp_pages')
                .select('path', 'updated_at')
                .union([knex.select('path', 'updated_at').from('blogs')])
                .union([
                    knex.raw(
                        "select CONCAT('/branch/', b.slug) as `path`, b.`updated_at` from `branches` b"
                    ),
                ])
                .orderBy('updated_at', 'desc');

            const root = create({ version: '1.0', encoding: 'UTF-8' }).ele(
                'urlset'
            );
            root.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
            const frontEndUrl = env('FRONT_END_URL');

            for (const pathObj of result) {
                const item = root.ele('url');
                item.ele('loc').txt(frontEndUrl + pathObj.path);
                const date = new Date(pathObj.updated_at);
                item.ele('lastmod').txt(
                    date
                        .toLocaleDateString('en-CA', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                        })
                        .replace(/\//g, '-')
                );
                item.ele('changefreq').txt('always');
                item.ele('priority').txt('1.0');
            }

            const xml = root.end({ prettyPrint: true });
            return xml;
        } catch (err) {
            console.log('Error on sitemap', err);
            return '';
        }
    },
};
