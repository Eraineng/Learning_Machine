# Release Readiness Checklist — <Release>

**Release date:** · **Build:** · **Decision meeting:** · **Decision owner:** <product>

## Testing
- [ ] All planned high-risk tests executed and passed
- [ ] Execution rate ≥ __% of planned tests
- [ ] Automated regression green on main (link to the CI run)
- [ ] Smoke tests pass on the release candidate build
- [ ] Exploratory session(s) completed for new features
- [ ] Re-testing of all fixed defects complete

## Defects
- [ ] 0 open Critical defects
- [ ] 0 open Major defects (or documented, accepted, with workarounds)
- [ ] All deferred defects have tickets and an agreed release
- [ ] Known issues list prepared for support

## Non-functional
- [ ] Performance within SLOs (p95 < __ms, error rate < __%)
- [ ] Load/spike test passed for the expected traffic
- [ ] No high/critical security findings; dependency scan clean
- [ ] Accessibility: no critical/serious axe violations on key flows
- [ ] Cross-browser / device matrix covered
- [ ] Visual regression baselines reviewed and approved

## Data, config and compatibility
- [ ] Database migrations tested (and a rollback tested!)
- [ ] Backward compatibility with the previous version verified
- [ ] Contract tests verified with all consumers (`can-i-deploy`)
- [ ] Feature flags configured for the correct audience
- [ ] Config/secrets present in the target environment

## Operations
- [ ] Monitoring and alerts in place for the new functionality
- [ ] Logging sufficient to debug the new flows
- [ ] Rollback plan documented and tested
- [ ] Support/CS informed: what's new, known issues, workarounds
- [ ] Post-deploy smoke tests ready to run (and automated if possible)
- [ ] Release notes / documentation updated

## Sign-off
| Role | Name | Decision | Date |
|------|------|----------|------|
| QA (recommendation) | | GO / NO-GO | |
| Development | | | |
| Product (final decision) | | | |

## Residual risk accepted
> <What we know is not covered or not fixed, who accepted it, and how we'll monitor it.>

## Post-release
- [ ] Smoke tests executed in production
- [ ] Error rates and key metrics monitored for __ hours
- [ ] Any escaped defect gets an RCA and a new automated test
