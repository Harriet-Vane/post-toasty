CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE public.share_email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  bread_id text,
  topping_ids text[],
  recipe_name text,
  share_url text,
  user_agent text,
  referrer text,
  hubspot_synced boolean NOT NULL DEFAULT false,
  hubspot_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.share_email_captures TO service_role;

ALTER TABLE public.share_email_captures ENABLE ROW LEVEL SECURITY;

CREATE INDEX share_email_captures_email_idx ON public.share_email_captures (email);
CREATE INDEX share_email_captures_created_at_idx ON public.share_email_captures (created_at DESC);