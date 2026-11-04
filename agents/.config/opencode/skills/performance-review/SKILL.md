---
name: performance-review
description: Use when analyzing code and architecture for query performance, resource allocations, algorithmic efficiency, caching, and scalability bottlenecks.
---

# Performance Review

## When to use
- Investigating high latency, throughput degradation, excessive CPU/memory consumption, or database load.
- Reviewing performance-critical paths (hot loops, search endpoints, data pipelines).
- Before shipping code expected to handle high concurrency or large data volumes.

## Inputs to gather
- Target code paths, query definitions, and data volume projections.
- Profiling traces, query execution plans (e.g. `EXPLAIN ANALYZE`), or benchmark numbers.
- Infrastructure constraints: memory limits, CPU bounds, database connection pool limits.

## Procedure
1. Identify hot paths:
   Locate code executed on critical request loops or high-frequency background jobs.
   Focus profiling efforts where the highest latency or throughput demands exist.
2. Inspect database interactions:
   Detect N+1 query patterns, missing indexes, unpaginated queries, and table scans.
   Analyze query plans using `EXPLAIN ANALYZE` or database profilers.
3. Analyze memory and allocations:
   Identify unnecessary object allocations, unbounded in-memory buffering, and leaks.
   Ensure file streams and network sockets are closed promptly.
4. Evaluate caching opportunities:
   Check if cache-aside, memoization, or HTTP caching can reduce expensive re-computations.
   Ensure cache invalidation rules are robust and prevent serving stale data.
5. Check concurrency and locks:
   Identify thread contention, excessive lock holding, or non-parallelized I/O.
   Use non-blocking asynchronous APIs where appropriate.
6. Require measurable proof:
   Benchmark code before and after modifications using realistic data sizes.
   Document quantified metrics rather than theoretical improvements.

## Output / handoff
- Performance report with identified bottlenecks, execution plans, and quantified improvements.
- Actionable recommendations for indexes, query refactoring, caching, or algorithmic changes.

## Verification and guardrails
- Never guess speedups; demand empirical before-and-after measurements or query plans.
- Do not sacrifice code readability or correctness for negligible micro-optimizations.
- Ensure benchmark tests are reproducible and isolated from external noise.
- Verify that performance changes introduce zero functional regressions.
