// server/partner.js - Single point of knowledge for ShieldBox API shapes
const versions = {
    v1: {
        path: '/reports',
        parse: body => {
            if (!body || typeof body !== 'object') throw new Error('invalid v1 payload');
            return {
                caseCode: body.caseCode || body.id,
                status: body.status || 'Pending',
                category: body.category || 'General',
                description: body.description || ''
            };
        }
    },
    v2: {
        path: '/v2/reports',
        parse: body => {
            if (!body || !body.data || typeof body.data !== 'object') {
                throw new Error('unexpected v2 shape');
            }
            const item = body.data;
            return {
                caseCode: item.caseCode || item.id,
                status: item.status || 'Pending',
                category: item.category || 'General',
                description: item.description || ''
            };
        }
    }
};

module.exports = { versions };