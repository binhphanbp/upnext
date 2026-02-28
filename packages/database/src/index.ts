/**
 * @upnext/database — Public API
 *
 * What to import from here:
 *  - `createDrizzleClient`  to instantiate a DB connection
 *  - `DrizzleClient`        TypeScript type for the Drizzle instance
 *  - All schema tables, enums, relations
 *  - All `Db*` inferred types (DbUser, DbJob, DbInterview, …)
 *  - All JSONB sub-types (AiFeedback, SalaryRange, …)
 */

// Connection factory + client type
export { createDrizzleClient, type DrizzleClient } from './connection'

// Full schema (tables, enums, relations)
export * from './schema/index'
