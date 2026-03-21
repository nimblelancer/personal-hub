-- Add resume_content column to profiles table
alter table profiles add column if not exists resume_content text;
