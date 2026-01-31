export declare const TESTER_STAGES: readonly ["prospect", "invited", "accepted", "installed", "onboarded", "active", "completed", "transitioned", "declined", "dropped_out", "unresponsive"];
export type TesterStage = (typeof TESTER_STAGES)[number];
export declare const TESTER_SOURCES: readonly ["email", "linkedin", "whatsapp", "referral", "other"];
export type TesterSource = (typeof TESTER_SOURCES)[number];
export declare const FEEDBACK_TYPES: readonly ["bug", "feature_request", "ux_issue", "general"];
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];
export declare const FEEDBACK_SEVERITIES: readonly ["critical", "major", "minor"];
export type FeedbackSeverity = (typeof FEEDBACK_SEVERITIES)[number];
export declare const FEEDBACK_STATUSES: readonly ["new", "in_review", "addressed", "closed"];
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];
export declare const INCIDENT_TYPES: readonly ["crash", "bug", "ux_complaint", "dropout", "uninstall"];
export type IncidentType = (typeof INCIDENT_TYPES)[number];
export declare const INCIDENT_SEVERITIES: readonly ["critical", "major", "minor"];
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];
export declare const INCIDENT_STATUSES: readonly ["open", "investigating", "resolved"];
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
export declare const COMMUNICATION_CHANNELS: readonly ["email", "whatsapp", "linkedin", "phone", "other"];
export type CommunicationChannel = (typeof COMMUNICATION_CHANNELS)[number];
export declare const COMMUNICATION_DIRECTIONS: readonly ["outbound", "inbound"];
export type CommunicationDirection = (typeof COMMUNICATION_DIRECTIONS)[number];
export declare const COMMUNICATION_STATUSES: readonly ["sent", "delivered", "opened", "clicked", "bounced", "failed"];
export type CommunicationStatus = (typeof COMMUNICATION_STATUSES)[number];
export declare const TEST_DURATION_DAYS = 14;
export declare const INACTIVITY_THRESHOLD_DAYS = 3;
export declare const RATE_LIMITS: {
    standard: {
        windowMs: number;
        max: number;
    };
    strict: {
        windowMs: number;
        max: number;
    };
};
//# sourceMappingURL=constants.d.ts.map