\set ON_ERROR_STOP on
\connect postgres

\echo 'Delete and recreate waggr db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS waggr;
CREATE DATABASE waggr;
\connect waggr

\i waggr-schema.sql
\i waggr-seed.sql

\echo 'Delete and recreate waggr_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS waggr_test;
CREATE DATABASE waggr_test;
\connect waggr_test

\i waggr-schema.sql
