\echo 'Delete and recreate dogly db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE dogly;
CREATE DATABASE dogly;
\connect dogly

\i dogly-schema.sql
\i dogly-seed.sql

\echo 'Delete and recreate dogly_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE dogly_test;
CREATE DATABASE dogly_test;
\connect dogly_test

\i dogly-schema.sql
