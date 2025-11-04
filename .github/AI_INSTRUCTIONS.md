# AI Contribution Guidelines for Yarn

These notes help any AI assistant or automation service contribute changes safely to this repository.

## High-Level Principles

- **Stay flight-focused**: Yarn is a flight price stacker. Any new code should support itinerary search, provider aggregation, discount stacking, or supporting infrastructure.
- **Keep the stack modern**: Use TypeScript, Next.js, Express, and shared utilities from `@yarn/shared`. Prefer functional, composable modules and avoid legacy JavaScript patterns.
- **Be deterministic**: All scripts should be idempotent and cross-platform. Use Biome for lint/format, Rimraf for deletions, and avoid shell-specific commands.

## Coding Standards

1. **Type safety**
   - Always enable strict TypeScript types. Prefer explicit interfaces exported from `@yarn/shared`.
   - Validate all request payloads with Zod on the server before processing.

2. **Formatting & linting**
   - Run `npm run lint` and `npm run format:check` before submitting anything.
   - Do not add ESLint or Prettier; Biome is the single source of formatting truth.

3. **Testing & quality**
   - Add unit tests for discount logic and provider adapters when behaviour changes.
   - Use dependency injection for external services to keep tests deterministic.

4. **Documentation**
   - Update `README.md` whenever you introduce a notable API, environment variable, or workflow.
   - Add inline comments only for complex logic (e.g., stack pruning heuristics).

## Pull Request Checklist

- [ ] `npm install`
- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run build`
- [ ] Tests (`npm run --if-present test`)
- [ ] Updated docs or changelog entries as required

## Release & Publishing

CI lives in `.github/workflows/ci.yml`. The pipeline must stay under 10 minutes and support Node 20. Avoid adding jobs that require paid services without discussion.

If you are unsure about a change, open an issue first and document assumptions. Consistency and transparency keep Yarn reliable for millions of travellers.
