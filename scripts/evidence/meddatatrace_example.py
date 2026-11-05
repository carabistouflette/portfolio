"""Exercise the pinned public HealthGraphBench MAUDE code with synthetic inputs.

Put the HealthGraphBench repository root on PYTHONPATH. The public revision
and source hashes are recorded in public/evidence/provenance.json.
"""

from healthgraphbench.tasks.maude.data import QuarterSnapshot
from healthgraphbench.tasks.maude.evaluate import eligible_edges, evaluate_method
from healthgraphbench.tasks.maude.models import FeatureContext, History

past = QuarterSnapshot(
    quarter="2019Q1",
    report_keys=2,
    product_reports={"A": 1, "B": 1},
    product_manufacturers={"A": frozenset({"M"}), "B": frozenset({"N"})},
    edges=frozenset({("A", "1"), ("B", "2")}),
    edge_report_counts={("A", "1"): 1, ("B", "2"): 1},
)
future = QuarterSnapshot(
    quarter="2019Q2",
    report_keys=2,
    product_reports={"A": 2},
    product_manufacturers={"A": frozenset({"M"})},
    edges=frozenset({("A", "2"), ("A", "3")}),
    edge_report_counts={("A", "2"): 1, ("A", "3"): 1},
)

history = History.empty()
history.add(past, {})
assert history.product_problems["A"] == {"1"}
assert history.product_problems["B"] == {"2"}
print("2019Q1 history: A -> [1]; B -> [2]")

candidates = history.candidate_problems("A")
assert candidates == ["2"]
print(f"2019Q2 candidates for A: [{', '.join(candidates)}]")

eligible = eligible_edges(future.edges, history)
assert eligible == frozenset({("A", "2")})
assert "3" not in history.problem_products
assert "2" not in history.product_problems["A"]
product, problem = next(iter(eligible))
print(f"2019Q2 eligible new link: {product} -> {problem}")
print("Problem 3 excluded: not in past history")

# Exercise the real ranking function without presenting toy scores as a benchmark.
context = FeatureContext(history, future.quarter, {})
metrics, _, _ = evaluate_method(
    context,
    eligible,
    lambda _product, candidate: float(len(history.problem_products[candidate])),
)
assert metrics["1"]["positive_edges"] == 1
assert metrics["1"]["hits_at_5"] == 1
assert history.product_problems["A"] == {"1"}

# Reveal the current quarter only after its candidates have been ranked.
history.add(future, {})
assert history.product_problems["A"] == {"1", "2", "3"}
print(f"2019Q3 history for A: [{', '.join(sorted(history.product_problems['A']))}]")
