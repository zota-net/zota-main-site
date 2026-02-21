import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface NetworkNode {
  id: string;
  name: string;
  type: 'router' | 'server' | 'switch' | 'endpoint' | 'firewall' | 'datacenter';
  status: 'online' | 'offline' | 'warning' | 'critical';
  traffic: number; // 0-1
  latency: number; // ms
  packetLoss: number; // percentage
  uptime: number; // percentage
  location?: { lat: number; lng: number };
  connections: string[];
  lastUpdated: number;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  nodeId?: string;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
}

export interface NetworkMetrics {
  totalNodes: number;
  activeNodes: number;
  totalTraffic: number; // Gbps
  averageLatency: number; // ms
  packetLossRate: number; // percentage
  uptime: number; // percentage
  activeConnections: number;
  dataProcessed: number; // TB
}

export interface NetworkState {
  // Data
  nodes: NetworkNode[];
  alerts: Alert[];
  metrics: NetworkMetrics;
  
  // Filters
  selectedNodeIds: string[];
  statusFilter: string[];
  typeFilter: string[];
  
  // Real-time simulation
  isSimulating: boolean;
  simulationSpeed: number;
  
  // Actions
  setNodes: (nodes: NetworkNode[]) => void;
  updateNode: (nodeId: string, updates: Partial<NetworkNode>) => void;
  addNode: (node: NetworkNode) => void;
  removeNode: (nodeId: string) => void;
  
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  clearAlerts: () => void;
  
  setMetrics: (metrics: Partial<NetworkMetrics>) => void;
  
  setSelectedNodes: (nodeIds: string[]) => void;
  setStatusFilter: (statuses: string[]) => void;
  setTypeFilter: (types: string[]) => void;
  
  setSimulating: (isSimulating: boolean) => void;
  setSimulationSpeed: (speed: number) => void;
  
  // Simulation tick
  simulateTick: () => void;
}

const generateInitialNodes = (): NetworkNode[] => {
  const nodeTypes: NetworkNode['type'][] = ['router', 'server', 'switch', 'endpoint', 'firewall', 'datacenter'];
  const nodes: NetworkNode[] = [];
  
  for (let i = 0; i < 50; i++) {
    const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
    nodes.push({
      id: `node-${i}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}-${i.toString().padStart(3, '0')}`,
      type,
      status: Math.random() > 0.9 ? 'warning' : Math.random() > 0.95 ? 'critical' : 'online',
      traffic: Math.random() * 0.8,
      latency: Math.random() * 50 + 5,
      packetLoss: Math.random() * 0.5,
      uptime: 99 + Math.random(),
      connections: [],
      lastUpdated: Date.now(),
    });
  }
  
  // Create connections
  nodes.forEach((node, i) => {
    const numConnections = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numConnections; j++) {
      const targetIndex = Math.floor(Math.random() * nodes.length);
      if (targetIndex !== i && !node.connections.includes(nodes[targetIndex].id)) {
        node.connections.push(nodes[targetIndex].id);
      }
    }
  });
  
  return nodes;
};

const initialMetrics: NetworkMetrics = {
  totalNodes: 50,
  activeNodes: 47,
  totalTraffic: 847.3,
  averageLatency: 14.2,
  packetLossRate: 0.02,
  uptime: 99.9997,
  activeConnections: 2400000,
  dataProcessed: 1247.8,
};

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      nodes: generateInitialNodes(),
      alerts: [],
      metrics: initialMetrics,
      selectedNodeIds: [],
      statusFilter: [],
      typeFilter: [],
      isSimulating: true,
      simulationSpeed: 1,

      setNodes: (nodes) => set({ nodes }),

      updateNode: (nodeId, updates) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId ? { ...node, ...updates, lastUpdated: Date.now() } : node
          ),
        })),

      addNode: (node) =>
        set((state) => ({
          nodes: [...state.nodes, node],
          metrics: { ...state.metrics, totalNodes: state.metrics.totalNodes + 1 },
        })),

      removeNode: (nodeId) =>
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          metrics: { ...state.metrics, totalNodes: state.metrics.totalNodes - 1 },
        })),

      addAlert: (alert) =>
        set((state) => ({
          alerts: [alert, ...state.alerts].slice(0, 100), // Keep last 100 alerts
        })),

      acknowledgeAlert: (alertId) =>
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
          ),
        })),

      resolveAlert: (alertId) =>
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === alertId ? { ...alert, resolved: true } : alert
          ),
        })),

      clearAlerts: () => set({ alerts: [] }),

      setMetrics: (metrics) =>
        set((state) => ({
          metrics: { ...state.metrics, ...metrics },
        })),

      setSelectedNodes: (nodeIds) => set({ selectedNodeIds: nodeIds }),

      setStatusFilter: (statuses) => set({ statusFilter: statuses }),

      setTypeFilter: (types) => set({ typeFilter: types }),

      setSimulating: (isSimulating) => set({ isSimulating }),

      setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),

      simulateTick: () => {
        const state = get();
        if (!state.isSimulating) return;

        const updatedNodes = state.nodes.map((node) => {
          // Simulate traffic fluctuation
          const trafficDelta = (Math.random() - 0.5) * 0.1 * state.simulationSpeed;
          const newTraffic = Math.max(0, Math.min(1, node.traffic + trafficDelta));
          
          // Simulate latency fluctuation
          const latencyDelta = (Math.random() - 0.5) * 5 * state.simulationSpeed;
          const newLatency = Math.max(1, Math.min(100, node.latency + latencyDelta));
          
          // Update status based on traffic
          let newStatus = node.status;
          if (newTraffic > 0.9) newStatus = 'critical';
          else if (newTraffic > 0.7) newStatus = 'warning';
          else if (node.status !== 'offline') newStatus = 'online';

          return {
            ...node,
            traffic: newTraffic,
            latency: newLatency,
            status: newStatus,
            lastUpdated: Date.now(),
          };
        });

        // Generate random alerts occasionally
        if (Math.random() < 0.05 * state.simulationSpeed) {
          const randomNode = updatedNodes[Math.floor(Math.random() * updatedNodes.length)];
          const alertTypes: Alert['type'][] = ['info', 'warning', 'error', 'critical'];
          const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
          
          const newAlert: Alert = {
            id: `alert-${Date.now()}`,
            type: alertType,
            title: `${alertType.charAt(0).toUpperCase() + alertType.slice(1)} on ${randomNode.name}`,
            message: `Detected ${alertType} condition on ${randomNode.type} ${randomNode.name}`,
            nodeId: randomNode.id,
            timestamp: Date.now(),
            acknowledged: false,
            resolved: false,
          };
          
          set((s) => ({
            alerts: [newAlert, ...s.alerts].slice(0, 100),
          }));
        }

        // Update metrics
        const activeNodes = updatedNodes.filter((n) => n.status !== 'offline').length;
        const avgLatency = updatedNodes.reduce((sum, n) => sum + n.latency, 0) / updatedNodes.length;
        const avgTraffic = updatedNodes.reduce((sum, n) => sum + n.traffic, 0) / updatedNodes.length;

        set({
          nodes: updatedNodes,
          metrics: {
            ...state.metrics,
            activeNodes,
            averageLatency: Math.round(avgLatency * 10) / 10,
            totalTraffic: Math.round((847 + (avgTraffic - 0.5) * 100) * 10) / 10,
          },
        });
      },
    }),
    {
      name: 'netnet-network-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedNodeIds: state.selectedNodeIds,
        statusFilter: state.statusFilter,
        typeFilter: state.typeFilter,
        simulationSpeed: state.simulationSpeed,
      }),
    }
  )
);
