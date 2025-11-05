import { testParser } from './server/clickup-report-parser';

const result = testParser();
console.log('Parsed Report:', JSON.stringify(result.parsed, null, 2));
console.log('\nValidation:', result.validation);
