# How I build with AI

I use AI tools heavily in this project. I do not treat that as a shortcut around engineering responsibility.

My role is to decide what problem is worth solving, define the system boundaries, set the quality bar, review the behavior, debug failures, and decide what is accepted or rejected.

## What I own

- choosing the product or research question;
- deciding what evidence would be strong enough to support a claim;
- defining the high-level architecture and safety boundaries;
- setting acceptance criteria and test requirements;
- deciding when a result is still unknown or unproven;
- reviewing and revising work that does not meet the bar.

## Where AI helps most

- implementation and code revision;
- exploring technical options;
- generating edge cases and tests;
- challenging assumptions;
- reviewing documentation and code;
- speeding up research and iteration.

## My working loop

```text
choose the real problem
-> define constraints and proof requirements
-> use AI to explore and implement
-> test the result against failures and edge cases
-> inspect the evidence
-> accept, revise, or reject
```

AI can generate a lot of output quickly. That makes the review loop more important, not less important.

## What I can explain myself

I can explain the problem, why I chose the approach, the system boundaries, the evidence requirements, what failed during implementation, what changed, and what remains unproven.

For a low-level technical or statistical choice that came from the AI-assisted implementation process, I say so rather than presenting every line or technique as manual authorship.

For concrete implementation evidence, see [../PROOF.md](../PROOF.md).
