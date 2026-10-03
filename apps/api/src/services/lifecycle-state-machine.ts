import { LifecycleStatus, VALID_TRANSITIONS } from '@smartwaste360/contracts';

export class InvalidStateTransitionError extends Error {
  constructor(public currentStatus: LifecycleStatus, public targetStatus: LifecycleStatus) {
    super(
      `Invalid lifecycle transition: cannot move from '${currentStatus}' directly to '${targetStatus}'. Allowed target states: [${
        VALID_TRANSITIONS[currentStatus]?.join(', ') || 'none'
      }]`
    );
    this.name = 'InvalidStateTransitionError';
  }
}

/**
 * Validates and executes guarded lifecycle state transition
 */
export function transitionLifecycleStatus(
  currentStatus: LifecycleStatus,
  targetStatus: LifecycleStatus
): LifecycleStatus {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw new InvalidStateTransitionError(currentStatus, targetStatus);
  }
  return targetStatus;
}
