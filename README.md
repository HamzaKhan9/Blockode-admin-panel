# Blockode Admin Panel

# Starting the application locally

## On development environment

`yarn start:dev`

## On production environment

`yarn start:prod`

# Serving edge functions locally

## On development environment

first create `env.local.dev` file in `supabase/` directory and copy the keys from supabase project then run:
`yarn serve:dev`

## On production environment

first create `env.local.prod` file in `supabase/` directory and copy the keys from supabase project then run:
`yarn serve:prod`

# Deploy edge functions

## On development environment

`yarn deploy:dev <function_names>`

## On production environment

`yarn deploy:prod <function_names>`
