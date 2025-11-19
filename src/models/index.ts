// Export all models and their interfaces
export {
  default as User,
  type IUser,
  type IGoogleCredentials,
} from './schema/User';
export { default as Category, type ICategory } from './schema/Category';
export { default as Movie, type IMovie } from './schema/Movie';
export { default as Series, type ISeries } from './schema/Series';

// Export database connection
export { default as dbConnect } from '../lib/mongodb';
