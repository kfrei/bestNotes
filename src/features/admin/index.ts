/**
 * BestNotes Admin Domain Index Facade
 * Domain: Administration, Telemetry, Storage Metrics & Analytics
 */

export * from './types';
export * from './services/userStatsService';
export * from './services/trafficService';
export * from './hooks/useAdminRoute';
export * from './hooks/useAppTelemetry';
// Note: AdminDashboard & Admin sub-views are intentionally NOT re-exported here
// so AdminPortal's React.lazy(() => import('./AdminDashboard')) code-splits the entire Admin chunk!
export * from './AdminPortal';
