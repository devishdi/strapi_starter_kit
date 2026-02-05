export default {
    formatTable: async (data) => {
        const headerData = [];
        const rowData = [];

        for (const header of data.header) {
            headerData.push(header.title);
        }

        for (const [index, item] of data.table.entries()) {
            const component = item?.__component;

            switch (component) {
                case 'corp-dynamic.collapsable-standard-text':
                    rowData[index] = {
                        type: 'standardText',
                        collapsableText: item.text,
                        columns: await strapi
                            .service('api::content.assorted-table')
                            .formatStandardText(item?.column),
                    };
                    break;
                case 'corp-dynamic.collapsable-table':
                    rowData[index] = {
                        type: 'standardTable',
                        collapsableText: item.text,
                        columns: await strapi
                            .service('api::content.assorted-table')
                            .formatStandardTable(item?.column),
                    };
                    break;
            }
        }

        return {
            header: headerData,
            hideHeader: data.hideHeader ?? 'false',
            rows: rowData,
        };
    },
    formatStandardText: async (columnData) => {
        const column = [];

        for (const [index, columnItem] of columnData.entries()) {
            column[index] = columnItem.row.map((rowItem) => {
                return {
                    boldText: rowItem.boldText,
                    normalText: rowItem.normalText,
                };
            });
        }

        return column;
    },
    formatStandardTable: async (columnData) => {
        const column = [];
        for (const [index, columnItem] of columnData.entries()) {
            const tableData = await strapi
                .service('api::content.assorted-table')
                .getTwoColumnTable(columnItem?.table);

            column[index] = {
                text: columnItem.title,
                table: tableData,
            };
        }

        return column;
    },
    getTwoColumnTable: async (tableData) => {
        return tableData.map((table) => {
            const header = {
                columnOne: table?.tableHeader?.columnOne,
                columnTwo: table?.tableHeader?.columnTwo,
            };

            const rows = table.rowData.map((data) => {
                return {
                    columnOne: data?.columnOne,
                    columnTwo: data?.columnTwo,
                };
            });

            return {
                text: table.text,
                header,
                rows,
            };
        });
    },
};
