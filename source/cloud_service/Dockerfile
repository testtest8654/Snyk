FROM elixir:1.12-slim as builder
WORKDIR /builder
COPY . .
ENV MIX_ENV=prod
RUN mix local.hex --force && \
    mix local.rebar --force && \
    mix deps.get && \
    mix release


FROM elixir:1.12-slim
WORKDIR /app
COPY --from=builder /builder/ .
EXPOSE 4001/tcp
CMD ["/app/_build/prod/rel/cloud_service/bin/cloud_service", "start"]
