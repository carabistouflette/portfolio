"""Run against the pinned public reference_semantics directory on PYTHONPATH."""
from semantics import evidence_state, State
from reference_admission import AdmissionInput, admit, Referenceability

for positive, negative, expected in [
    (False, False, State.UNKNOWN),
    (True, False, State.APPLIES),
    (False, True, State.NOT_APPLICABLE),
    (True, True, State.CONFLICTING),
]:
    result = evidence_state(positive, negative)
    assert result is expected
    print(f"presence={str(positive).lower()}, absence={str(negative).lower()} -> {result.value}")

# A paper names a dataset, but its evaluation-to-artifact linkage is not supported.
reference = admit(AdmissionInput(
    evaluation_identified=True,
    artifact_linkage_supported=False,
    artifacts_pinned=True,
    identity_basis_supported=True,
    computation_reproducible=False,
))
assert reference.referenceability is Referenceability.REFERENCE_UNSCORABLE
assert reference.gold_state is None
print(f"Incomplete artifact linkage -> {reference.referenceability.value}; gold_state=None")
