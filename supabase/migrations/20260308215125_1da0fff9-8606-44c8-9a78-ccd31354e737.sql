
-- Add building_number and is_verified_resident to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS building_number text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified_resident boolean DEFAULT false;

-- Create polls table
CREATE TABLE public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  target_buildings text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create poll_options table
CREATE TABLE public.poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create poll_votes table
CREATE TABLE public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_id uuid REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls RLS: everyone authenticated can view active polls
CREATE POLICY "Authenticated can view polls" ON public.polls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and representative can create polls" ON public.polls FOR INSERT TO authenticated WITH CHECK (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'representative')
);
CREATE POLICY "Creator can update own polls" ON public.polls FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Admin can delete polls" ON public.polls FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Poll options RLS
CREATE POLICY "Authenticated can view poll options" ON public.poll_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and representative can manage options" ON public.poll_options FOR INSERT TO authenticated WITH CHECK (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'representative')
);

-- Poll votes RLS
CREATE POLICY "Users can view votes" ON public.poll_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote" ON public.poll_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own vote" ON public.poll_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);
