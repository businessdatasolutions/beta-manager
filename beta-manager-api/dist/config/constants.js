"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMITS = exports.INACTIVITY_THRESHOLD_DAYS = exports.TEST_DURATION_DAYS = exports.COMMUNICATION_STATUSES = exports.COMMUNICATION_DIRECTIONS = exports.COMMUNICATION_CHANNELS = exports.INCIDENT_STATUSES = exports.INCIDENT_SEVERITIES = exports.INCIDENT_TYPES = exports.FEEDBACK_STATUSES = exports.FEEDBACK_SEVERITIES = exports.FEEDBACK_TYPES = exports.TESTER_SOURCES = exports.TESTER_STAGES = void 0;
exports.TESTER_STAGES = [
    'prospect',
    'invited',
    'accepted',
    'installed',
    'onboarded',
    'active',
    'completed',
    'transitioned',
    'declined',
    'dropped_out',
    'unresponsive',
];
exports.TESTER_SOURCES = ['email', 'linkedin', 'whatsapp', 'referral', 'other'];
exports.FEEDBACK_TYPES = ['bug', 'feature_request', 'ux_issue', 'general'];
exports.FEEDBACK_SEVERITIES = ['critical', 'major', 'minor'];
exports.FEEDBACK_STATUSES = ['new', 'in_review', 'addressed', 'closed'];
exports.INCIDENT_TYPES = ['crash', 'bug', 'ux_complaint', 'dropout', 'uninstall'];
exports.INCIDENT_SEVERITIES = ['critical', 'major', 'minor'];
exports.INCIDENT_STATUSES = ['open', 'investigating', 'resolved'];
exports.COMMUNICATION_CHANNELS = ['email', 'whatsapp', 'linkedin', 'phone', 'other'];
exports.COMMUNICATION_DIRECTIONS = ['outbound', 'inbound'];
exports.COMMUNICATION_STATUSES = ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'];
exports.TEST_DURATION_DAYS = 14;
exports.INACTIVITY_THRESHOLD_DAYS = 3;
exports.RATE_LIMITS = {
    standard: { windowMs: 60 * 1000, max: 100 }, // 100 req/min
    strict: { windowMs: 60 * 1000, max: 10 }, // 10 req/min for public routes
};
//# sourceMappingURL=constants.js.map