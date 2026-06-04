DELETE FROM public.subscriptions s
USING (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) AS rn
    FROM public.subscriptions WHERE plan_type='trial'
  ) t WHERE t.rn > 1
) d
WHERE s.id = d.id;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_trial_per_user
ON public.subscriptions (user_id)
WHERE plan_type = 'trial';