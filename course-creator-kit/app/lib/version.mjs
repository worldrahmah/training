import fs from 'node:fs';
const release=Object.freeze(JSON.parse(fs.readFileSync(new URL('../../release/version.json',import.meta.url),'utf8')));
export const APP_NAME=release.app_name;
export const APP_VERSION=release.app_version;
export const CORE_SCHEMA_VERSION=release.core_schema_version;
export const COURSE_AUTHORING_SCHEMA_VERSION=release.course_authoring_schema_version;
export const RELEASE_TOKEN=release.release_token;
export const RELEASE_IDENTITY=release;
