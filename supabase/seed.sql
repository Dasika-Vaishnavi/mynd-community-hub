-- Optional seed data for public.posts.

insert into public.posts (
  author_name,
  author_karma,
  title,
  preview,
  flair,
  space,
  upvotes,
  comments,
  pet_color,
  pet_expression
)
values
  (
    'MindfulMango',
    2340,
    'Small wins matter - I made my bed today',
    'I know it sounds trivial but after weeks of barely functioning, making my bed felt huge.',
    'Celebration',
    'UnwindYourMynd',
    847,
    63,
    'hsl(329, 86%, 70%)',
    'excited'
  ),
  (
    'QuietStorm_',
    560,
    'Does anyone else feel like they are performing being okay?',
    'At work I am all smiles but inside I am running on fumes. Looking for people who relate.',
    'Support Needed',
    'AnxietySupport',
    412,
    89,
    'hsl(252, 75%, 60%)',
    'calm'
  ),
  (
    'ADHDKnight',
    8920,
    'The body doubling technique changed my productivity forever',
    'I discovered body doubling and my focus went from zero to productive.',
    'Resource',
    'ADHDWarriors',
    1203,
    124,
    'hsl(142, 69%, 58%)',
    'happy'
  );
