"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import {
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { savePositionAction } from "@/app/actions/concepts";
import { defineTopicAction } from "@/app/actions/define";
import { persistSuggestionsAction } from "@/app/actions/graph";
import { LearningOrder, NodePanel } from "@/components/node-panel";
import { SimplifyIcon, ViewModeIcon } from "@/components/nav-icons";
import { AddConceptForm } from "@/components/space-forms";
import {
  levelLabels,
  priorityLabels,
  statusLabels,
  typeLabels,
  type ConceptType,
  type GraphView,
  type KnowledgeStatus,
  type Priority,
} from "@/lib/domain";
import { briefFor, isCatalogCopy, type TopicBrief } from "@/lib/graph/brief";
import { arrangeReadable, buildMesh, type MeshLink, type MeshNode, type OpenedSuggestion, type ShowMore } from "@/lib/graph/mesh";
import { relatedTopicBudget } from "@/lib/graph/related";
import { normalizeTitle } from "@/lib/graph/normalize";
import { spaceNodeId } from "@/lib/graph/timeline";

let definitionQueue: Promise<void> = Promise.resolve();

function enqueueDefinition(task: () => Promise<void>) {
  definitionQueue = definitionQueue.then(task).then(
    () => undefined,
    () => undefined,
  );
}

type ConceptNodeData = {
  title: string;
  type: ConceptType;
  priority: Priority;
  status: GraphView["concepts"][number]["status"];
  origin: "user" | "ai" | "space";
  pathLabel: string;
  role: "space" | "captured" | "related";
  faded: boolean;
  summary: string;
  description: string;
  homeX: number;
  homeY: number;
  pinned: boolean;
  width: number;
  height: number;
  diameter: number;
  anchorId: string | null;
  relationship: string;
  captureNumber: number | null;
};

type FlowNode = Node<ConceptNodeData, "concept">;

type Filters = { type: "all" | ConceptType; priority: "all" | Priority; hideUnderstood: boolean };

const nodeTypes = { concept: ConceptNode };

const Definitions = createContext<{
  briefs: Record<string, TopicBrief>;
  pendingKey: string | null;
  misses: Record<string, true>;
}>({
  briefs: {},
  pendingKey: null,
  misses: {},
});

function topicKey(title: string) {
  return normalizeTitle(title);
}

function CardGlyph({ kind }: { kind: "book" | "tag" | "flag" | "mark" }) {
  return (
    <svg className="concept-card-icon" viewBox="0 0 16 16" aria-hidden="true">
      {kind === "book" ? (
        <>
          <path d="M2.5 3.2h4.2A1.8 1.8 0 0 1 8.5 5v8.2A1.4 1.4 0 0 0 7.1 11.8H2.5z" />
          <path d="M13.5 3.2H9.3A1.8 1.8 0 0 0 7.5 5v8.2a1.4 1.4 0 0 1 1.4-1.4h4.6z" />
        </>
      ) : null}
      {kind === "tag" ? (
        <path d="M2.6 8.2 8 2.8h4.2V7L7.2 12.8a1.2 1.2 0 0 1-1.7 0L2.6 9.9a1.2 1.2 0 0 1 0-1.7zM10.6 5.2h.1" />
      ) : null}
      {kind === "flag" ? <path d="M3.5 13.2V2.8H12l-1.6 2.6L12 8H3.5" /> : null}
      {kind === "mark" ? <path d="M8 2.8a5.2 5.2 0 1 1 0 10.4A5.2 5.2 0 0 1 8 2.8zM5.6 8.1l1.6 1.6 3.2-3.3" /> : null}
    </svg>
  );
}

function ConceptNode({ data, selected }: NodeProps<FlowNode>) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [above, setAbove] = useState(true);
  const space = data.role === "space";
  const defs = useContext(Definitions);
  const key = topicKey(data.title);
  const brief = defs.briefs[key];
  const summary =
    brief?.definition ||
    (defs.misses[key] || !isCatalogCopy(data.title, data.summary)
      ? data.summary
      : "Writing a definition…");
  const showCard = Boolean(selected && hovered);

  useEffect(() => {
    if (!showCard) return;
    let frame = 0;
    const place = () => {
      const rect = nodeRef.current?.getBoundingClientRect();
      if (rect) {
        const next = rect.top > 180;
        setAbove((current) => (current === next ? current : next));
      }
      frame = requestAnimationFrame(place);
    };
    frame = requestAnimationFrame(place);
    return () => cancelAnimationFrame(frame);
  }, [showCard]);

  return (
    <div
      ref={nodeRef}
      className={`concept-node ${selected ? "is-selected" : ""}`}
      style={{ width: data.width, height: data.height }}
      data-role={data.role}
      data-type={data.type}
      data-status={data.status}
      data-origin={data.origin}
      data-mark={data.pathLabel}
      data-faded={data.faded ? "true" : "false"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="concept-orb">
        <Handle id="top-source" type="source" position={Position.Top} style={{ left: "50%" }} />
        <Handle id="top-target" type="target" position={Position.Top} style={{ left: "50%" }} />
        <Handle id="bottom-source" type="source" position={Position.Bottom} style={{ left: "50%" }} />
        <Handle id="bottom-target" type="target" position={Position.Bottom} style={{ left: "50%" }} />
        <Handle id="left" type="target" position={Position.Left} style={{ top: "50%" }} />
        <Handle id="left-source" type="source" position={Position.Left} style={{ top: "50%" }} />
        <Handle id="right" type="source" position={Position.Right} style={{ top: "50%" }} />
        <Handle id="right-target" type="target" position={Position.Right} style={{ top: "50%" }} />
        <Handle id="center-source" type="source" position={Position.Top} style={{ left: "50%", top: "50%" }} />
        <Handle id="center-target" type="target" position={Position.Top} style={{ left: "50%", top: "50%" }} />
        {data.captureNumber != null ? (
          <span className="concept-capture-number" aria-hidden="true">
            {data.captureNumber}
          </span>
        ) : null}
        <p className="concept-title">{data.title}</p>
        {data.pathLabel ? <p className="concept-path">{data.pathLabel}</p> : null}
      </div>
      {showCard ? (
        <div className={`concept-card nodrag nopan ${above ? "is-above" : "is-below"}`} role="note">
          <p className="concept-card-title">{data.title}</p>
          <p className="concept-card-explain">
            <CardGlyph kind="book" />
            <span>{summary}</span>
          </p>
          <ul className="concept-card-meta">
            <li>
              <CardGlyph kind="tag" />
              {space ? "Start" : typeLabels[data.type]}
            </li>
            {space ? null : (
              <li>
                <CardGlyph kind="flag" />
                {priorityLabels[data.priority]}
              </li>
            )}
            {space ? null : (
              <li>
                <CardGlyph kind="mark" />
                {statusLabels[data.status]}
              </li>
            )}
            {data.pathLabel ? <li>{data.pathLabel}</li> : null}
          </ul>
        </div>
      ) : null}
      <p className="sr-only">
        {space
          ? "Learning space."
          : data.faded
            ? `Suggested topic, faded until opened. ${data.summary}`
            : `${data.origin === "user" ? `Captured ${data.captureNumber ?? ""}.` : `${typeLabels[data.type]}.`} ${priorityLabels[data.priority]}. ${statusLabels[data.status]}.`}
      </p>
    </div>
  );
}

function readSuggestions(key: string): OpenedSuggestion[] {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Partial<OpenedSuggestion>;
      if (typeof record.id !== "string" || typeof record.anchorId !== "string" || typeof record.title !== "string") return [];
      return [{ id: record.id, anchorId: record.anchorId, title: record.title }];
    });
  } catch {
    return [];
  }
}

function readOpened(spaceId: string) {
  return readSuggestions(`mesh-opened:${spaceId}`);
}

function readKept(spaceId: string) {
  return readSuggestions(`mesh-kept:${spaceId}`);
}

function readBriefs(spaceId: string): Record<string, TopicBrief> {
  try {
    const raw = sessionStorage.getItem(`mesh-briefs:${spaceId}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const briefs: Record<string, TopicBrief> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!value || typeof value !== "object") continue;
      const record = value as Partial<TopicBrief>;
      if (typeof record.definition !== "string" || typeof record.more !== "string") continue;
      if (isCatalogCopy(key, record.definition)) continue;
      briefs[key] = { definition: record.definition, more: record.more };
    }
    return briefs;
  } catch {
    return {};
  }
}

function linkHandles(source: { x: number; y: number } | undefined, target: { x: number; y: number } | undefined) {
  if (!source || !target) return {};
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  if (Math.abs(dy) > Math.abs(dx)) {
    const sourceBelow = dy < 0;
    return {
      sourceHandle: sourceBelow ? "top-source" : "bottom-source",
      targetHandle: sourceBelow ? "bottom-target" : "top-target",
    };
  }
  const sourceLeft = dx >= 0;
  return {
    sourceHandle: sourceLeft ? "right" : "left-source",
    targetHandle: sourceLeft ? "left" : "right-target",
  };
}

function toFlow(mesh: { nodes: MeshNode[]; links: MeshLink[] }, pins: Record<string, { x: number; y: number }>) {
  const nodes: FlowNode[] = mesh.nodes.map((node) => {
    const onRail = node.role === "space" || node.role === "captured";
    const pin = onRail ? undefined : pins[node.id];
    const x = pin?.x ?? node.x;
    const y = pin?.y ?? node.y;
    return {
    id: node.id,
    type: "concept" as const,
    position: { x, y },
    width: node.width,
    height: node.height,
    draggable: !onRail,
    zIndex: node.role === "space" ? 4 : onRail ? 3 : node.faded ? 1 : 2,
    style: { width: node.width, height: node.height, overflow: "visible" },
    data: {
      title: node.title,
      type: node.type,
      priority: node.priority,
      status: node.status,
      origin: node.origin,
      pathLabel: node.pathLabel,
      role: node.role,
      faded: node.faded,
      summary: node.summary,
      description: node.description,
      homeX: x,
      homeY: y,
      pinned: pin != null,
      width: node.width,
      height: node.height,
      diameter: node.diameter,
      anchorId: node.anchorId,
      relationship: node.relationship,
      captureNumber: node.captureNumber,
    },
  };
  });
  const centers = new Map(
    nodes.map((node) => [
      node.id,
      { x: node.position.x + node.data.width / 2, y: node.position.y + node.data.height / 2 },
    ]),
  );
  const edges: Edge[] = mesh.links.map((link) => ({
    id: link.id,
    source: link.source,
    target: link.target,
    label: link.kind === "timeline" ? undefined : link.label,
    ...(link.kind === "timeline"
      ? linkHandles(centers.get(link.source), centers.get(link.target))
      : { sourceHandle: "center-source", targetHandle: "center-target" }),
    type: "straight" as const,
    animated: false,
    style: {
      stroke: link.kind === "timeline" ? "var(--accent)" : "var(--graph-edge)",
      strokeWidth: link.kind === "timeline" ? 2 : link.faded ? 1.2 : 1.5,
      opacity: link.kind === "timeline" ? 0.9 : link.faded ? 0.35 : 0.7,
      ...(link.faded ? { strokeDasharray: "5 7" } : {}),
    },
    labelStyle: { fill: "var(--foreground)", fontSize: 10, fontWeight: 600 },
    labelBgStyle: { fill: "var(--graph-label-halo)" },
    labelBgPadding: [4, 2] as [number, number],
    labelBgBorderRadius: 6,
  }));
  return { nodes, edges };
}

function directNeighbors(edges: Edge[], hoverId: string) {
  const neighbors = new Set<string>();
  for (const edge of edges) {
    if (edge.source === hoverId) neighbors.add(edge.target);
    if (edge.target === hoverId) neighbors.add(edge.source);
  }
  return neighbors;
}

function focusLinks(edges: Edge[], hoverId: string | null) {
  if (!hoverId) return edges;
  return edges.map((edge) => {
    const direct = edge.source === hoverId || edge.target === hoverId;
    return {
      ...edge,
      className: direct ? "is-hot" : "is-dim",
      zIndex: direct ? 5 : 0,
      style: {
        ...edge.style,
        stroke: direct ? "var(--accent)" : edge.style?.stroke,
        strokeWidth: direct ? 2.75 : edge.style?.strokeWidth,
        opacity: direct ? 1 : 0.16,
      },
    };
  });
}

function savedPins(graph: GraphView) {
  const pins: Record<string, { x: number; y: number }> = {};
  for (const concept of graph.concepts) {
    if (concept.positionX == null || concept.positionY == null) continue;
    pins[concept.id] = { x: concept.positionX, y: concept.positionY };
  }
  return pins;
}

function phaseOf(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) hash = (hash * 31 + id.charCodeAt(index)) % 1000;
  return hash / 70;
}

const captureStatusColors: Record<KnowledgeStatus, string> = {
  unfamiliar: "#dfe5ee",
  partial: "#f0e2c4",
  learn_later: "#e8daf0",
  understood: "#d4e8dc",
};

function minimapNodeColor(node: Node) {
  const data = node.data as ConceptNodeData;
  if (data.role === "space") return "#d7a441";
  if (data.faded) return "#4a5568";
  if (data.role === "captured" || data.origin === "user") {
    return captureStatusColors[data.status] ?? captureStatusColors.unfamiliar;
  }
  if (data.type === "prerequisite") return "#d7a441";
  if (data.type === "project") return "#b09aa6";
  return "#8ea0b4";
}

function GraphCanvas({
  visibleNodes,
  visibleEdges,
  selectedId,
  showMinimap,
  focusId,
  focusNonce,
  viewMode,
  onSelect,
  onPlace,
}: {
  visibleNodes: FlowNode[];
  visibleEdges: Edge[];
  selectedId: string | null;
  showMinimap: boolean;
  focusId: string | null;
  focusNonce: number;
  viewMode: boolean;
  onSelect: (conceptId: string | null) => void;
  onPlace: (id: string, x: number, y: number) => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(visibleNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(visibleEdges);
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const dragging = useRef(new Set<string>());
  const fittedSize = useRef("");
  const flow = useRef<{
    fitView: (options: {
      padding?: number;
      duration?: number;
      maxZoom?: number;
      nodes?: { id: string }[];
    }) => Promise<boolean>;
  } | null>(null);
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;

  useEffect(() => {
    const element = document.querySelector(".knowledge-graph");
    if (!element) return;
    const fit = () => {
      if (!flow.current || element.clientHeight < 80) return;
      const size = `${visibleNodes.map((node) => node.id).join("|")}:${element.clientWidth}x${element.clientHeight}`;
      if (fittedSize.current === size) return;
      fittedSize.current = size;
      void flow.current.fitView({ padding: 0.2, duration: 350 });
    };
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    fit();
    return () => observer.disconnect();
  }, [visibleNodes]);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setColorMode(root.dataset.theme === "dark" ? "dark" : "light");
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setNodes(
      visibleNodes.map((node) => ({
        ...node,
        draggable: viewMode ? false : node.draggable,
        selected: node.id === selectedRef.current,
      })),
    );
    setEdges(visibleEdges);
  }, [visibleNodes, visibleEdges, viewMode, setNodes, setEdges]);

  useEffect(() => {
    if (viewMode) dragging.current.clear();
  }, [viewMode]);

  useEffect(() => {
    const neighbors = hoverId ? directNeighbors(visibleEdges, hoverId) : null;
    const baseZ = new Map(visibleNodes.map((node) => [node.id, node.zIndex]));
    setNodes((current) =>
      current.map((node) => {
        const linked = neighbors != null && (node.id === hoverId || neighbors.has(node.id));
        const zIndex = baseZ.get(node.id) ?? node.zIndex;
        return {
          ...node,
          className: linked ? "is-linked" : undefined,
          zIndex: linked ? Math.max(zIndex ?? 0, 6) : zIndex,
        };
      }),
    );
    setEdges(focusLinks(visibleEdges, hoverId));
  }, [hoverId, visibleNodes, visibleEdges, setNodes, setEdges]);

  useEffect(() => {
    setNodes((current) => current.map((node) => ({ ...node, selected: node.id === selectedId })));
  }, [selectedId, setNodes]);

  useEffect(() => {
    if (!focusId || focusNonce === 0) return;
    const timer = window.setTimeout(() => {
      void flow.current?.fitView({
        nodes: [{ id: focusId }],
        padding: 0.5,
        duration: 350,
        maxZoom: 1.1,
      });
    }, 420);
    return () => window.clearTimeout(timer);
  }, [focusId, focusNonce]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      if (now - last > 48) {
        last = now;
        setNodes((current) => {
          let changed = false;
          const next = current.map((node) => {
            if (dragging.current.has(node.id) || node.data.pinned || node.data.role !== "related") return node;
            const phase = phaseOf(node.id);
            const x = node.data.homeX + Math.sin(now / 1600 + phase) * 6;
            const y = node.data.homeY + Math.cos(now / 1900 + phase * 1.3) * 5;
            if (Math.abs(node.position.x - x) < 0.4 && Math.abs(node.position.y - y) < 0.4) return node;
            changed = true;
            return { ...node, position: { x, y } };
          });
          return changed ? next : current;
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [setNodes]);

  return (
    <ReactFlow
      className="knowledge-graph"
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      colorMode={colorMode}
      onInit={(instance) => {
        flow.current = instance;
        fittedSize.current = "";
        void instance.fitView({ padding: 0.2, duration: 400 });
      }}
      minZoom={0.08}
      maxZoom={1.6}
      nodesConnectable={false}
      nodesDraggable={!viewMode}
      edgesReconnectable={false}
      onNodeClick={(_, node) => onSelect(node.id)}
      onNodeMouseEnter={(_, node) => {
        setHoverId(node.id);
      }}
      onNodeMouseLeave={() => setHoverId(null)}
      onPaneClick={() => onSelect(null)}
      onNodeDragStart={(_, node) => {
        dragging.current.add(node.id);
      }}
      onNodeDragStop={(_, node) => {
        dragging.current.delete(node.id);
        if (viewMode) return;
        const x = Math.round(node.position.x);
        const y = Math.round(node.position.y);
        setNodes((current) =>
          current.map((item) =>
            item.id === node.id
              ? { ...item, position: { x, y }, data: { ...item.data, homeX: x, homeY: y, pinned: true } }
              : item,
          ),
        );
        onPlace(node.id, x, y);
      }}
      proOptions={{ hideAttribution: false }}
    >
      <Controls />
      {showMinimap ? (
        <MiniMap
          className="knowledge-minimap"
          ariaLabel="Graph overview"
          bgColor="var(--card)"
          maskColor="rgb(16 20 28 / 62%)"
          maskStrokeColor="var(--accent)"
          maskStrokeWidth={1.5}
          nodeColor={minimapNodeColor}
          nodeStrokeColor={(node) => (node.selected ? "#d7a441" : "rgb(230 225 212 / 35%)")}
          nodeStrokeWidth={1.5}
          nodeBorderRadius={999}
          pannable
          zoomable
        />
      ) : null}
    </ReactFlow>
  );
}

function readMinimapPref() {
  try {
    return sessionStorage.getItem("mesh-minimap") !== "off";
  } catch {
    return true;
  }
}

export function KnowledgeGraph({ graph, initialSelectedId }: { graph: GraphView; initialSelectedId: string | null }) {
  const [filters, setFilters] = useState<Filters>({ type: "all", priority: "all", hideUnderstood: false });
  const baseId = spaceNodeId(graph.space.id);
  const persistedSuggestions = useRef("");
  const selectedTitle = useRef("");
  const hasCaptures = graph.concepts.some((concept) => concept.origin === "user");
  const [selectedId, setSelectedId] = useState(
    () => initialSelectedId ?? (hasCaptures ? null : baseId),
  );
  const [opened, setOpened] = useState<OpenedSuggestion[]>([]);
  const [kept, setKept] = useState<OpenedSuggestion[]>([]);
  const [openedReady, setOpenedReady] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [viewMode, setViewMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);
  const [suggestionPages, setSuggestionPages] = useState<Record<string, number>>({});
  const [focus, setFocus] = useState<{ id: string; nonce: number } | null>(null);
  const [placed, setPlaced] = useState<Record<string, { x: number; y: number }>>(() => savedPins(graph));
  const [briefs, setBriefs] = useState<Record<string, TopicBrief>>({});
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [misses, setMisses] = useState<Record<string, true>>({});
  const placedSpace = useRef(graph.space.id);
  if (placedSpace.current !== graph.space.id) {
    placedSpace.current = graph.space.id;
    setPlaced(savedPins(graph));
    setSuggestionPages({});
    setBriefs({});
    setMisses({});
    setPendingKey(null);
  }

  useEffect(() => {
    setOpened(readOpened(graph.space.id));
    setKept(readKept(graph.space.id));
    setShowMinimap(readMinimapPref());
    setBriefs(readBriefs(graph.space.id));
    setMisses({});
    setPendingKey(null);
    setOpenedReady(true);
  }, [graph.space.id]);

  useEffect(() => {
    if (!openedReady) return;
    try {
      sessionStorage.setItem(`mesh-opened:${graph.space.id}`, JSON.stringify(opened));
      sessionStorage.setItem(`mesh-kept:${graph.space.id}`, JSON.stringify(kept));
    } catch {
      // The map still works for this visit if storage is blocked.
    }
  }, [opened, kept, openedReady, graph.space.id]);

  useEffect(() => {
    if (!openedReady) return;
    try {
      sessionStorage.setItem(`mesh-briefs:${graph.space.id}`, JSON.stringify(briefs));
    } catch {
      // Definitions still show for this visit if storage is blocked.
    }
  }, [briefs, openedReady, graph.space.id]);

  useEffect(() => {
    if (!openedReady) return;
    try {
      sessionStorage.setItem("mesh-minimap", showMinimap ? "on" : "off");
    } catch {
      // Preference is session-only; ignore storage failures.
    }
  }, [showMinimap, openedReady]);

  const mesh = useMemo(
    () =>
      buildMesh({
        spaceId: graph.space.id,
        spaceName: graph.space.name,
        level: graph.space.level,
        depth: graph.space.depth,
        concepts: graph.concepts.map((concept) => ({
          id: concept.id,
          title: concept.title,
          type: concept.type,
          origin: concept.origin,
          priority: concept.priority,
          status: concept.status,
          explanation: concept.explanation,
          whyItMatters: concept.whyItMatters,
          prerequisiteReason: concept.prerequisiteReason,
          captureOrder: concept.captureOrder,
          parentId: concept.parentId,
        })),
        edges: graph.edges.map((edge) => ({
          id: edge.id,
          sourceId: edge.sourceId,
          targetId: edge.targetId,
          relationship: edge.relationship,
          origin: edge.origin,
        })),
        selectedId,
        opened,
        kept,
        filters,
        suggestionPages,
      }),
    [graph, selectedId, opened, kept, filters, suggestionPages],
  );

  useEffect(() => {
    if (!selectedId) return;
    const current = mesh.nodes.find((node) => node.id === selectedId);
    if (current) {
      selectedTitle.current = current.title;
      return;
    }
    const title = selectedTitle.current;
    if (!title) return;
    const match = mesh.nodes.find((node) => node.title.toLowerCase() === title.toLowerCase());
    if (match) setSelectedId(match.id);
  }, [mesh, selectedId]);

  useEffect(() => {
    const focusId = selectedId && mesh.nodes.some((node) => node.id === selectedId) ? selectedId : baseId;
    const pending = mesh.nodes.filter((node) => node.role === "related" && !node.conceptId);
    if (pending.length === 0) return;
    const pages = suggestionPages[focusId] ?? 1;
    const key = `${graph.space.id}:${focusId}:${pages}:${pending.map((node) => node.title).join("|")}`;
    if (persistedSuggestions.current === key) return;
    const focusTitle = mesh.nodes.find((node) => node.id === focusId)?.title ?? "";
    const extras = pending.map((node) => {
      const anchor = node.anchorId ? mesh.nodes.find((item) => item.id === node.anchorId) : null;
      const linked = mesh.links.find(
        (link) =>
          node.anchorId != null &&
          ((link.source === node.id && link.target === node.anchorId) ||
            (link.target === node.id && link.source === node.anchorId)),
      );
      return {
        title: node.title,
        type: node.type,
        priority: node.priority,
        explanation: node.summary,
        whyItMatters: node.description,
        relationship: node.relationship,
        anchorId: anchor?.conceptId ?? (anchor?.role === "captured" ? anchor.id : null),
        anchorTitle: anchor && anchor.role !== "space" ? anchor.title : null,
        focusIsSource: Boolean(linked && node.anchorId && linked.source === node.anchorId),
      };
    });
    const timer = window.setTimeout(() => {
      persistedSuggestions.current = key;
      void persistSuggestionsAction(graph.space.id, focusId, pages, focusTitle, extras);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [mesh, selectedId, suggestionPages, graph.space.id, baseId]);

  const flow = useMemo(() => toFlow(mesh, placed), [mesh, placed]);
  const activeId = selectedId && graph.concepts.some((concept) => concept.id === selectedId) ? selectedId : null;
  const selectedNode = mesh.nodes.find((node) => node.id === selectedId) ?? null;
  const canvasSelected = selectedNode ? selectedId : null;
  const selectedConcept = selectedNode
    ? (graph.concepts.find((concept) => concept.id === (selectedNode.conceptId ?? selectedNode.id)) ?? null)
    : null;

  useEffect(() => {
    if (!selectedNode) return;
    const key = topicKey(selectedNode.title);
    if (briefs[key] || misses[key]) return;
    const explanation = selectedConcept?.explanation ?? "";
    if (explanation.trim() && !isCatalogCopy(selectedNode.title, explanation)) {
      const stored = briefFor({
        title: selectedNode.title,
        summary: selectedNode.summary,
        description: selectedNode.description,
        explanation: selectedConcept?.explanation,
        whyItMatters: selectedConcept?.whyItMatters,
        example: selectedConcept?.example,
        goalRelationship: selectedConcept?.goalRelationship,
      });
      setBriefs((current) => (current[key] ? current : { ...current, [key]: stored }));
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      enqueueDefinition(async () => {
        if (cancelled) return;
        setPendingKey(key);
        try {
          const result = await defineTopicAction(graph.space.id, selectedNode.title);
          if (cancelled) return;
          setPendingKey((current) => (current === key ? null : current));
          if ("error" in result) {
            setMisses((current) => ({ ...current, [key]: true }));
            return;
          }
          setBriefs((current) => ({ ...current, [key]: result }));
        } catch {
          if (cancelled) return;
          setPendingKey((current) => (current === key ? null : current));
          setMisses((current) => ({ ...current, [key]: true }));
        }
      });
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      setPendingKey((current) => (current === key ? null : current));
    };
  }, [selectedNode, selectedConcept, briefs, misses, graph.space.id]);

  function placeNode(id: string, x: number, y: number) {
    setPlaced((current) => ({ ...current, [id]: { x, y } }));
    if (graph.concepts.some((concept) => concept.id === id)) void savePositionAction(id, x, y);
  }

  function selectNode(id: string | null) {
    if (!id) {
      setSelectedId(null);
      return;
    }
    const node = mesh.nodes.find((item) => item.id === id);
    const concept = graph.concepts.find((item) => item.id === id);
    const title = node?.title ?? concept?.title;
    const related = node?.role === "related" || concept?.origin === "ai";
    if (related && title && (node?.faded || !node)) {
      const linked = graph.edges.find((edge) => edge.sourceId === id || edge.targetId === id);
      const otherId = linked ? (linked.sourceId === id ? linked.targetId : linked.sourceId) : null;
      const anchorId =
        node?.anchorId ??
        (otherId && (otherId === baseId || graph.concepts.some((item) => item.id === otherId && item.origin === "user"))
          ? otherId
          : baseId);
      setOpened((current) =>
        current.some((item) => item.id === id || item.title === title) ? current : [...current, { id, anchorId, title }],
      );
      if (node?.faded) {
        const siblings = mesh.nodes.filter(
          (item) => item.role === "related" && item.faded && item.anchorId === anchorId && item.id !== id,
        );
        if (siblings.length > 0) {
          setKept((current) => {
            const merged = [...current];
            for (const sibling of siblings) {
              if (merged.some((item) => item.id === sibling.id || item.title === sibling.title)) continue;
              merged.push({ id: sibling.id, anchorId, title: sibling.title });
            }
            return merged;
          });
        }
      }
    }
    setSelectedId(id);
    setInfoOpen(true);
  }

  function simplifyGraph() {
    const next = arrangeReadable(mesh.nodes);
    setPlaced((current) => ({ ...current, ...next }));
  }

  function showMoreSuggestions() {
    const more = mesh.showMore;
    if (!more) return;
    if (more.action === "expand") {
      setSuggestionPages((current) => ({
        ...current,
        [more.focusId]: (current[more.focusId] ?? 1) + 1,
      }));
      return;
    }
    setSuggestionPages((current) => ({
      ...current,
      [more.parentId]: (current[more.parentId] ?? 1) + 1,
    }));
    selectNode(more.parentId);
  }

  return (
    <Definitions.Provider value={{ briefs, pendingKey, misses }}>
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <GraphRail side="left" label="Timeline" defaultWidth={300}>
        {selectedNode ? <NodeGlance key={selectedNode.id} node={selectedNode} concept={selectedConcept} /> : null}
        <LearningOrder graph={graph} selectedId={activeId} onSelect={selectNode} />
      </GraphRail>
      <div className="flex min-h-0 min-w-[160px] flex-1 flex-col">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--card)] px-4 py-3">
          <TopicSearch
            nodes={mesh.nodes}
            concepts={graph.concepts}
            onSelect={(id) => {
              selectNode(id);
              setFocus({ id, nonce: Date.now() });
            }}
          />
          <FilterSelect
            label="Type"
            value={filters.type}
            onChange={(type) => setFilters((current) => ({ ...current, type: type as Filters["type"] }))}
            options={["all", "captured", "prerequisite", "suggested", "project"]}
          />
          <FilterSelect
            label="Priority"
            value={filters.priority}
            onChange={(priority) => setFilters((current) => ({ ...current, priority: priority as Filters["priority"] }))}
            options={["all", "must", "should", "nice", "out_of_scope"]}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.hideUnderstood}
              onChange={(event) => setFilters((current) => ({ ...current, hideUnderstood: event.target.checked }))}
            />
            Hide understood
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showMinimap}
              onChange={(event) => setShowMinimap(event.target.checked)}
            />
            Minimap
          </label>
          <p className="text-xs text-[var(--muted)]">
            Light bubbles are your captures. Tint marks knowledge state. Faded dark bubbles are suggestions.
          </p>
          <div className="ml-auto flex flex-wrap gap-3 text-xs text-[var(--muted)]">
            <span className="legend-dot" data-status="unfamiliar">Unfamiliar</span>
            <span className="legend-dot" data-status="partial">Partial</span>
            <span className="legend-dot" data-status="learn_later">Learn later</span>
            <span className="legend-dot" data-status="understood">Understood</span>
          </div>
        </div>
        <div className="graph-stage relative min-h-0 flex-1">
          <GraphSky />
          <GraphCanvas
            visibleNodes={flow.nodes}
            visibleEdges={flow.edges}
            selectedId={canvasSelected}
            showMinimap={showMinimap}
            focusId={focus?.id ?? null}
            focusNonce={focus?.nonce ?? 0}
            viewMode={viewMode}
            onSelect={selectNode}
            onPlace={placeNode}
          />
          <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-2">
            <button
              type="button"
              className="graph-corner-button icon-button pointer-events-auto"
              aria-pressed={viewMode}
              aria-label={viewMode ? "Exit view mode" : "View mode"}
              data-hint={viewMode ? "Exit view mode" : "View mode"}
              onClick={() => setViewMode((current) => !current)}
            >
              <ViewModeIcon active={viewMode} />
            </button>
            <button
              type="button"
              className="graph-corner-button icon-button pointer-events-auto"
              aria-label="Simplify graph"
              data-hint="Simplify graph"
              onClick={simplifyGraph}
            >
              <SimplifyIcon />
            </button>
            <ShowMoreSuggestions more={mesh.showMore} onClick={showMoreSuggestions} />
          </div>
        </div>
      </div>
      <RightDock
        defaultWidth={380}
        top={{
          id: "add-concept-card",
          label: "Add concept",
          open: addOpen,
          onToggle: () => setAddOpen((current) => !current),
        }}
        bottom={{
          id: "node-info-card",
          label: "Node info",
          open: infoOpen,
          onToggle: () => setInfoOpen((current) => !current),
        }}
        topContent={
            <div className="grid gap-3 p-4">
              <p className="text-xs text-[var(--muted)]">
                {selectedNode && selectedNode.role !== "space" ? `Nests under ${selectedNode.title}.` : "Select a node to nest under it."}
              </p>
              <p className="text-sm text-[var(--muted)]">
                Up to {relatedTopicBudget(graph.space.level)} related topics appear around the concept you select, faded until you open them. Show more suggestions continues from the parent when that node runs out.
              </p>
              <AddConceptForm
                spaceId={graph.space.id}
                concepts={graph.concepts}
                stacked
                defaultParentId={
                  activeId ??
                  (selectedNode && selectedNode.role !== "space" && selectedNode.conceptId
                    ? selectedNode.conceptId
                    : "")
                }
              />
            </div>
        }
        bottomContent={
        <>
        {!selectedNode ? (
          <p className="p-4 text-sm text-[var(--muted)]">Click a node to see its details here.</p>
        ) : null}
        {selectedId === baseId && selectedNode ? (
          <div className="grid gap-2 p-4">
            <h2 className="text-lg font-semibold">{graph.space.name}</h2>
            <p className="text-sm">{selectedNode.summary}</p>
            {selectedNode.description ? (
              <p className="text-sm text-[var(--muted)]">{selectedNode.description}</p>
            ) : null}
            <p className="text-sm text-[var(--muted)]">
              {levelLabels[graph.space.level]} starts with {relatedTopicBudget(graph.space.level)} related topics as faded bubbles. Show more suggestions adds the next batch, or continues from the parent when this topic runs out.
            </p>
          </div>
        ) : null}
        {activeId ? (
          <div key={activeId} className="slide-card">
            <NodePanel graph={graph} selectedId={activeId} onClear={() => selectNode(null)} />
          </div>
        ) : null}
        {selectedNode && selectedNode.role === "related" && !activeId ? (
          <div className="grid gap-2 p-4">
            <h2 className="text-lg font-semibold">{selectedNode.title}</h2>
            <p className="text-sm text-[var(--muted)]">
              {selectedNode.relationship
                ? `Related by “${selectedNode.relationship}”. It stays on the map once you open it.`
                : "Opened suggestion. It stays on the map for this visit."}
            </p>
            <p className="text-sm">{selectedNode.summary}</p>
            {selectedNode.description ? <p className="text-sm text-[var(--muted)]">{selectedNode.description}</p> : null}
          </div>
        ) : null}
        </>
        }
      />
    </div>
    </Definitions.Provider>
  );
}

function NodeGlance({
  node,
  concept,
}: {
  node: MeshNode;
  concept: GraphView["concepts"][number] | null;
}) {
  const [open, setOpen] = useState(false);
  const defs = useContext(Definitions);
  const key = topicKey(node.title);
  const generated = defs.briefs[key];
  const fallback = briefFor({
    title: node.title,
    summary: node.summary,
    description: node.description,
    explanation: concept?.explanation,
    whyItMatters: concept?.whyItMatters,
    example: concept?.example,
    goalRelationship: concept?.goalRelationship,
  });
  const copy = generated
    ? generated
    : defs.misses[key] || !isCatalogCopy(node.title, fallback.definition)
      ? fallback
      : { definition: "Writing a definition…", more: "" };
  const space = node.role === "space";

  return (
    <section className="grid gap-2 border-b border-[var(--line)] p-4">
      <h3 className="text-sm font-semibold">Definition</h3>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {space ? "Start" : typeLabels[node.type]}
        {node.faded ? " · Suggestion" : ""}
      </p>
      <h2 className="text-base font-semibold leading-tight">{node.title}</h2>
      {space ? null : (
        <p className="text-xs text-[var(--muted)]">
          {priorityLabels[node.priority]} · {statusLabels[node.status]}
          {node.pathLabel ? ` · ${node.pathLabel}` : ""}
        </p>
      )}
      <p className="text-sm leading-snug">{copy.definition}</p>
      {copy.more ? (
        <>
          <button
            type="button"
            className="glance-cta justify-self-start"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? "Show less" : "Learn more"}
          </button>
          {open ? <p className="text-sm leading-relaxed">{copy.more}</p> : null}
        </>
      ) : null}
    </section>
  );
}

function ShowMoreSuggestions({ more, onClick }: { more: ShowMore | null; onClick: () => void }) {
  if (!more) return null;
  return (
    <button
      type="button"
      className="graph-corner-button pointer-events-auto"
      onClick={onClick}
      aria-label={more.action === "parent" ? `Show more suggestions from ${more.parentTitle}` : "Show more suggestions"}
    >
      Show more suggestions
    </button>
  );
}

function GraphSky() {
  return (
    <div className="graph-sky" aria-hidden="true">
      <div className="graph-clouds" />
      <div className="graph-mesh" />
    </div>
  );
}

function TopicSearch({
  nodes,
  concepts,
  onSelect,
}: {
  nodes: MeshNode[];
  concepts: GraphView["concepts"];
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!needle) return [];
    const fromNodes = nodes
      .filter((node) => node.title.toLowerCase().includes(needle))
      .map((node) => ({ id: node.id, title: node.title }));
    const seen = new Set(fromNodes.map((item) => item.title.toLowerCase()));
    const fromConcepts = concepts
      .filter((concept) => concept.title.toLowerCase().includes(needle) && !seen.has(concept.title.toLowerCase()))
      .map((concept) => ({ id: concept.id, title: concept.title }));
    return [...fromNodes, ...fromConcepts].slice(0, 8);
  }, [needle, nodes, concepts]);

  function choose(id: string) {
    onSelect(id);
    setQuery("");
  }

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && matches[0]) {
            event.preventDefault();
            choose(matches[0].id);
          }
          if (event.key === "Escape") setQuery("");
        }}
        placeholder="Search topics"
        aria-label="Search topics"
        className="w-44 rounded-md border border-[var(--line)] bg-[var(--background)] px-2 py-1 text-sm outline-none ring-[var(--accent)] focus:ring-2"
      />
      {needle ? (
        <ul className="absolute left-0 top-full z-30 mt-1 max-h-60 w-64 overflow-auto border border-[var(--line)] bg-[var(--card)]">
          {matches.length === 0 ? (
            <li className="px-2 py-1.5 text-xs text-[var(--muted)]">No matching topics</li>
          ) : (
            matches.map((match) => (
              <li key={match.id}>
                <button
                  type="button"
                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-[var(--background)]"
                  onClick={() => choose(match.id)}
                >
                  {match.title}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      {label}
      <select className="rounded-md border border-[var(--line)] bg-[var(--card)] px-2 py-1" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? "All" : option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

const MIN_RAIL = 240;
const MAX_RAIL = 560;

function clampRail(width: number) {
  return Math.min(MAX_RAIL, Math.max(MIN_RAIL, width));
}

function GraphRail({
  side,
  label,
  defaultWidth,
  children,
}: {
  side: "left" | "right";
  label: string;
  defaultWidth: number;
  children: ReactNode;
}) {
  const [width, setWidth] = useState(defaultWidth);
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`flex h-full min-h-0 shrink-0 overflow-hidden bg-[var(--card)] ${side === "left" ? "border-r" : "border-l"} border-[var(--line)]`}
      style={{ width: open ? width : 44 }}
      aria-label={label}
    >
      {side === "right" && open ? <RailHandle label={label} side={side} width={width} onWidth={setWidth} /> : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className={open ? "flex shrink-0 items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2" : "hidden"}>
          <h2 className="text-sm font-semibold">{label}</h2>
          <button
            type="button"
            className="grid h-7 w-7 shrink-0 place-items-center border border-[var(--line)] text-[var(--foreground)]"
            aria-label={`Hide ${label}`}
            aria-expanded={true}
            onClick={() => setOpen(false)}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <div className={open ? "min-h-0 flex-1 overflow-y-auto" : "hidden"}>{children}</div>
        <button
          type="button"
          className={open ? "hidden" : "flex min-h-0 flex-1 items-center justify-center px-1 text-xs font-semibold tracking-wide"}
          style={{ writingMode: "vertical-rl" }}
          aria-expanded={false}
          onClick={() => setOpen(true)}
        >
          {label}
        </button>
      </div>
      {side === "left" && open ? <RailHandle label={label} side={side} width={width} onWidth={setWidth} /> : null}
    </aside>
  );
}

type DockPanel = {
  id: string;
  label: string;
  open: boolean;
  onToggle: () => void;
};

const DOCK_TAB = 36;

function RightDock({
  defaultWidth,
  top,
  bottom,
  topContent,
  bottomContent,
}: {
  defaultWidth: number;
  top: DockPanel;
  bottom: DockPanel;
  topContent: ReactNode;
  bottomContent: ReactNode;
}) {
  const [width, setWidth] = useState(defaultWidth);
  const anyOpen = top.open || bottom.open;
  const panels = [
    { panel: top, content: topContent },
    { panel: bottom, content: bottomContent },
  ];

  return (
    <aside
      className="flex h-full min-h-0 shrink-0 overflow-hidden border-l border-[var(--line)] bg-[var(--card)]"
      style={{ width: anyOpen ? width + DOCK_TAB : DOCK_TAB }}
      aria-label="Concept sidebars"
    >
      {anyOpen ? <RailHandle label="sidebars" side="right" width={width} onWidth={setWidth} /> : null}
      {anyOpen ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-3">
          {panels.map(({ panel, content }) =>
            panel.open ? (
              <section
                key={panel.id}
                id={panel.id}
                className="slide-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--background)]"
                aria-label={panel.label}
              >
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2">
                  <h2 className="text-sm font-semibold">{panel.label}</h2>
                  <button
                    type="button"
                    className="grid h-7 w-7 shrink-0 place-items-center border border-[var(--line)] text-[var(--foreground)]"
                    aria-label={`Close ${panel.label}`}
                    onClick={panel.onToggle}
                  >
                    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                      <path d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">{content}</div>
              </section>
            ) : null,
          )}
        </div>
      ) : null}
      <div className="flex shrink-0 flex-col justify-between border-l border-[var(--line)]" style={{ width: DOCK_TAB }}>
        {panels.map(({ panel }) => (
          <button
            key={panel.id}
            type="button"
            className="dock-tab"
            aria-expanded={panel.open}
            aria-controls={panel.id}
            aria-pressed={panel.open}
            onClick={panel.onToggle}
          >
            <span className="dock-tab-light" aria-hidden="true" />
            <span className="dock-tab-label">{panel.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function RailHandle({
  label,
  side,
  width,
  onWidth,
}: {
  label: string;
  side: "left" | "right";
  width: number;
  onWidth: (width: number) => void;
}) {
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startWidth: width };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const delta = side === "left" ? event.clientX - drag.current.startX : drag.current.startX - event.clientX;
    onWidth(clampRail(drag.current.startWidth + delta));
  }

  function onPointerUp() {
    drag.current = null;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 40 : 16;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const sign = side === "left" ? direction : -direction;
    onWidth(clampRail(width + sign * step));
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${label}`}
      aria-valuemin={MIN_RAIL}
      aria-valuemax={MAX_RAIL}
      aria-valuenow={Math.round(width)}
      tabIndex={0}
      className="w-2 shrink-0 cursor-col-resize touch-none bg-[var(--line)] hover:bg-[var(--accent)] focus-visible:bg-[var(--accent)]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    />
  );
}
