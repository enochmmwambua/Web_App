// server/partner.test.js
const { versions } = require('./partner');

const v1Body = { id: 'SB-88219', status: 'In Review', category: 'maintenance', description: 'Cable slips' };
const v2Body = { data: { caseCode: 'SB-88219', status: 'In Review', category: 'maintenance', description: 'Cable slips' } };
const wanted = { caseCode: 'SB-88219', status: 'In Review', category: 'maintenance', description: 'Cable slips' };

test('v1 and v2 give app the exact same parsed object', () => {
    expect(versions.v1.parse(v1Body)).toEqual(wanted);
    expect(versions.v2.parse(v2Body)).toEqual(wanted);
});

test('wrong parser fails loudly', () => {
    expect(() => versions.v2.parse(v1Body)).toThrow('unexpected v2 shape');
});