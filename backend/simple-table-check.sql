-- Simple check script for table structures
-- Run this in Supabase SQL Editor

-- Clients table
select 'clients:' as table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'clients'
order by ordinal_position;

-- Profiles table
select 'profiles:' as table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
order by ordinal_position;

-- Projects table
select 'projects:' as table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'projects'
order by ordinal_position;

-- Milestones table
select 'milestones:' as table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'milestones'
order by ordinal_position;
