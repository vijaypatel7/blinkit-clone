/**
 * Admin mappers.
 */
export function toAuditLogResponse(log) {
  if (!log) return null;
  const l = log.toObject ? log.toObject() : log;
  return {
    id: l._id,
    actorId: l.actorId,
    actorRole: l.actorRole,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    before: l.before,
    after: l.after,
    createdAt: l.createdAt,
  };
}
