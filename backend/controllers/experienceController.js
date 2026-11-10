import Experience from '../models/Experience.js';
import crudFactory from './crudFactory.js';
import { toBool } from '../utils/parse.js';

export default crudFactory(Experience, {
  fields: ['role', 'organization', 'location', 'startDate', 'endDate', 'current', 'description', 'kind', 'order'],
  requiredFields: ['role', 'startDate'],
  prepare: (d) => ({ ...d, ...(d.current !== undefined ? { current: toBool(d.current) } : {}) }),
});
