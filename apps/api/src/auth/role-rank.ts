// The hierarchy itself lives in @kathapp/shared so the API guards and the web
// UI cannot drift apart about who may do what (ADR 0003).
export { roleAtLeast } from '@kathapp/shared';
