from langgraph.graph import (
    StateGraph,
    START,
    END
)

from ai_service.state import AnalysisState

from ai_service.agents.patient_context_agent import (
    patient_context_agent
)

from ai_service.agents.previous_session_agent import (
    previous_session_agent
)

from ai_service.agents.comparison_agent import (
    comparison_agent
)

from ai_service.agents.summary_agent import (
    summary_agent
)

from ai_service.agents.supervisor_agent import (
    supervisor_agent
)


# =========================================
# CREATE GRAPH
# =========================================

builder = StateGraph(
    AnalysisState
)


# =========================================
# ADD NODES
# =========================================

builder.add_node(
    "patient_context",
    patient_context_agent
)

builder.add_node(
    "previous_session",
    previous_session_agent
)

builder.add_node(
    "comparison",
    comparison_agent
)

builder.add_node(
    "summary",
    summary_agent
)

builder.add_node(
    "supervisor",
    supervisor_agent
)


# =========================================
# CONNECT GRAPH
# =========================================

builder.add_edge(
    START,
    "patient_context"
)

builder.add_edge(
    "patient_context",
    "previous_session"
)

builder.add_edge(
    "previous_session",
    "comparison"
)

builder.add_edge(
    "comparison",
    "summary"
)

builder.add_edge(
    "summary",
    "supervisor"
)

builder.add_edge(
    "supervisor",
    END
)


# =========================================
# COMPILE GRAPH
# =========================================

analysis_graph = builder.compile()