import Skill from '../models/Skill.js';
import crudFactory from './crudFactory.js';

export default crudFactory(Skill, {
  fields: ['name', 'group', 'level', 'description', 'technologies', 'icon', 'active', 'order'],
  requiredFields: ['name'],
  sort: { group: 1, order: 1, name: 1 },
  prepare: (data) => {
    if (typeof data.technologies === 'string') {
      data.technologies = data.technologies
        .split(',')
        .map((technology) => technology.trim())
        .filter(Boolean);
    }
    return data;
  },
});
